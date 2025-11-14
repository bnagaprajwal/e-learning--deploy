import { GoogleGenerativeAI } from '@google/generative-ai';

export interface PDFQuestionResponse {
  answer: string;
  source: 'pdf' | 'ai'; // Whether the answer came from PDF or general AI
  confidence: 'high' | 'medium' | 'low';
}

class PDFAnalysisService {
  private gem?: GoogleGenerativeAI;
  private enabled: boolean;

  constructor() {
    this.enabled = false;
    this.gem = undefined;
    
    try {
      const apiKey = import.meta.env.VITE_GOOGLE_CLOUD_API_KEY as string | undefined;
      if (!apiKey || apiKey.trim() === '') {
        this.enabled = false;
        return;
      }
      
      try {
        this.gem = new GoogleGenerativeAI(apiKey);
        this.enabled = true;
      } catch (initError) {
        console.warn('Failed to initialize Google Generative AI:', initError);
        this.enabled = false;
        this.gem = undefined;
      }
    } catch (error) {
      console.warn('Failed to initialize PDFAnalysisService:', error);
      this.enabled = false;
      this.gem = undefined;
    }
  }

  /**
   * Convert file to base64
   */
  private async fileToBase64(file: File): Promise<string> {
    return new Promise<string>((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => {
        const result = reader.result as string;
        const base64 = result.split(',')[1];
        resolve(base64);
      };
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });
  }

  /**
   * Ask a question about the PDF content
   */
  async askQuestion(file: File, question: string): Promise<PDFQuestionResponse> {
    if (!this.enabled || !this.gem) {
      return {
        answer: 'AI service is not available. Please configure your Google Cloud API key in the .env file.',
        source: 'ai',
        confidence: 'low'
      };
    }

    try {
      const model = this.gem.getGenerativeModel({ 
        model: 'gemini-2.5-pro',
        generationConfig: {
          temperature: 0.3,
          topP: 0.95,
        }
      });

      // Convert PDF to base64
      const base64 = await this.fileToBase64(file);

      const prompt = `You are an intelligent document analysis assistant. A user has uploaded a PDF document and asked a question about it.

CRITICAL INSTRUCTIONS:
1. First, carefully analyze the PDF content to see if it contains information relevant to the user's question.
2. If the answer CAN be found in the PDF:
   - Answer the question using ONLY information from the PDF
   - Be specific and cite relevant details from the document
   - Format your answer in a structured way:
     * Use clear paragraphs for different topics
     * Use bullet points (-) or numbered lists (1., 2., etc.) for multiple items
     * Use section headers (ending with :) for major topics
     * Break long paragraphs into shorter, readable chunks
   - Return a JSON object with: {"answer": "your structured answer from PDF", "source": "pdf", "confidence": "high"}

3. If the answer CANNOT be found in the PDF:
   - Start your answer with: "⚠️ The information you're looking for is not present in the uploaded PDF document. However, here's a general answer:"
   - Then provide a helpful general AI answer in a structured format:
     * Use clear paragraphs
     * Use bullet points (-) or numbered lists for multiple items
     * Use section headers (ending with :) for major topics
     * Break information into digestible sections
   - Return a JSON object with: {"answer": "⚠️ The information you're looking for is not present in the uploaded PDF document. However, here's a general answer:\n\n[your structured general answer]", "source": "ai", "confidence": "medium"}

4. If the answer is PARTIALLY in the PDF:
   - Provide the information from the PDF first in a structured format
   - Then mention what additional information might be helpful
   - Return: {"answer": "pdf answer (structured).\n\nNote: [additional info]", "source": "pdf", "confidence": "medium"}

FORMATTING GUIDELINES:
- Use line breaks (\\n) to separate paragraphs
- Use bullet points (-) for lists
- Use numbered lists (1., 2., 3.) for sequential steps
- Use section headers (ending with :) for major topics
- Keep paragraphs concise (3-4 sentences max)
- Make the answer easy to scan and read

User's Question: ${question}

IMPORTANT: Return ONLY valid JSON. Do not include any markdown, code blocks, or explanatory text. Only return the JSON object.
Example format: {"answer": "your structured answer here\\n\\nWith proper formatting", "source": "pdf", "confidence": "high"}`;

      const result = await model.generateContent([
        {
          inlineData: {
            data: base64,
            mimeType: 'application/pdf'
          }
        },
        { text: prompt }
      ]);

      const responseText = result.response.text().trim();
      
      // Try to parse JSON response
      let parsed: PDFQuestionResponse;
      try {
        // Remove markdown code blocks if present
        let cleanResponse = responseText
          .replace(/^```json\s*/i, '')
          .replace(/^```\s*/i, '')
          .replace(/```$/i, '')
          .trim();
        
        // Remove any text before the first {
        const firstBrace = cleanResponse.indexOf('{');
        if (firstBrace > 0) {
          cleanResponse = cleanResponse.substring(firstBrace);
        }
        
        // Remove any text after the last }
        const lastBrace = cleanResponse.lastIndexOf('}');
        if (lastBrace >= 0 && lastBrace < cleanResponse.length - 1) {
          cleanResponse = cleanResponse.substring(0, lastBrace + 1);
        }
        
        // Extract JSON object
        const jsonMatch = cleanResponse.match(/\{[\s\S]*\}/);
        if (jsonMatch) {
          parsed = JSON.parse(jsonMatch[0]);
          
          // Validate the parsed response
          if (!parsed.answer || !parsed.source) {
            throw new Error('Invalid response format');
          }
          
          // Determine source based on answer content if source seems wrong
          const answerLower = parsed.answer.toLowerCase();
          if (answerLower.includes('not present') || answerLower.includes('cannot find') || answerLower.includes('⚠️')) {
            parsed.source = 'ai';
          }
        } else {
          throw new Error('No JSON found in response');
        }
      } catch (parseError) {
        // If parsing fails, analyze the response text to determine source
        const responseLower = responseText.toLowerCase();
        const isFromPDF = !responseLower.includes('not present') && 
                         !responseLower.includes('cannot find') && 
                         !responseLower.includes('⚠️') &&
                         responseLower.length > 20; // Reasonable answer length
        
        parsed = {
          answer: responseText,
          source: isFromPDF ? 'pdf' : 'ai',
          confidence: 'medium'
        };
      }

      return parsed;
    } catch (error: any) {
      console.error('PDF analysis error:', error);
      return {
        answer: `Failed to analyze PDF: ${error?.message || 'Unknown error'}. Please try again.`,
        source: 'ai',
        confidence: 'low'
      };
    }
  }

  /**
   * Check if service is enabled
   */
  isEnabled(): boolean {
    return this.enabled;
  }
}

export default PDFAnalysisService;

