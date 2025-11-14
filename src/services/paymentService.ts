import { loadScript } from './utils/razorpayLoader';
import { db } from '../config/firebase';
import { collection, addDoc, doc, getDoc, updateDoc, Timestamp } from 'firebase/firestore';
import { auth } from '../config/firebase';

export interface PaymentOrder {
  id: string;
  courseId: string;
  courseTitle: string;
  amount: number;
  currency: string;
  userId: string;
  status: 'pending' | 'completed' | 'failed' | 'refunded';
  razorpayOrderId?: string;
  razorpayPaymentId?: string;
  razorpaySignature?: string;
  createdAt: Date;
  updatedAt: Date;
}

class PaymentService {
  private razorpayKeyId: string;

  constructor() {
    this.razorpayKeyId = import.meta.env.VITE_RAZORPAY_KEY_ID || '';
    
    if (!this.razorpayKeyId) {
      console.warn('Razorpay Key ID not found in environment variables');
    }
  }

  /**
   * Initialize Razorpay script
   */
  async initializeRazorpay(): Promise<boolean> {
    try {
      await loadScript('https://checkout.razorpay.com/v1/checkout.js');
      return true;
    } catch (error) {
      console.error('Failed to load Razorpay script:', error);
      return false;
    }
  }

  /**
   * Create a payment order in Firestore
   */
  async createPaymentOrder(
    courseId: string,
    courseTitle: string,
    amount: number,
    userId: string
  ): Promise<string> {
    try {
      if (!db) {
        throw new Error('Firestore is not configured. Please check your Firebase configuration.');
      }

      // Validate inputs
      if (!courseId || !courseTitle || !amount || !userId) {
        throw new Error('Missing required payment order fields');
      }

      if (amount <= 0) {
        throw new Error('Amount must be greater than 0');
      }

      const orderData = {
        courseId,
        courseTitle,
        amount,
        currency: 'INR',
        userId,
        status: 'pending' as const,
        createdAt: Timestamp.now(),
        updatedAt: Timestamp.now(),
      };

      const docRef = await addDoc(collection(db, 'payments'), orderData);
      return docRef.id;
    } catch (error: any) {
      console.error('Error creating payment order:', error);
      // Provide more specific error message
      if (error.code === 'permission-denied') {
        throw new Error('Permission denied. Please check Firestore security rules for the payments collection.');
      } else if (error.message) {
        throw new Error(`Failed to create payment order: ${error.message}`);
      } else {
        throw new Error('Failed to create payment order. Please check your Firebase configuration and try again.');
      }
    }
  }

  /**
   * Create Razorpay order and initiate payment
   */
  async initiatePayment(
    orderId: string,
    amount: number,
    courseTitle: string,
    userName: string,
    userEmail: string,
    userPhone: string
  ): Promise<any> {
    try {
      // Initialize Razorpay
      const initialized = await this.initializeRazorpay();
      if (!initialized) {
        throw new Error('Failed to initialize Razorpay');
      }

      // Create order on backend (you'll need to create an API endpoint for this)
      // For now, we'll use Razorpay's client-side order creation
      // Note: In production, orders should be created on the backend for security
      
      const options = {
        key: this.razorpayKeyId,
        amount: amount * 100, // Convert to paise (Razorpay expects amount in smallest currency unit)
        currency: 'INR',
        name: 'VP Learning Platform',
        description: `Payment for ${courseTitle}`,
        order_id: undefined as string | undefined, // Will be set by backend API
        handler: async (response: any) => {
          // This will be handled by the calling component
          return response;
        },
        prefill: {
          name: userName,
          email: userEmail,
          contact: userPhone || '9999999999', // Default phone if not provided
        },
        theme: {
          color: '#2563eb',
        },
        // Enable UPI and other payment methods
        method: {
          upi: true,
          card: true,
          netbanking: true,
          wallet: true,
        },
        // Configure UPI settings
        config: {
          display: {
            blocks: {
              banks: {
                name: 'All payment methods',
                instruments: [
                  {
                    method: 'upi',
                  },
                  {
                    method: 'card',
                  },
                  {
                    method: 'netbanking',
                  },
                  {
                    method: 'wallet',
                  },
                ],
              },
            },
            sequence: ['block.banks'],
            preferences: {
              show_default_blocks: true,
            },
          },
        },
        modal: {
          ondismiss: () => {
            // Handle payment cancellation
            console.log('Payment cancelled by user');
          },
        },
      };

      // For production, you should create the order on your backend
      // Here's a placeholder for the backend API call
      // const orderResponse = await fetch('/api/payments/create-order', {
      //   method: 'POST',
      //   headers: { 'Content-Type': 'application/json' },
      //   body: JSON.stringify({ amount: options.amount, currency: options.currency }),
      // });
      // const orderData = await orderResponse.json();
      // options.order_id = orderData.id;

      return options;
    } catch (error: any) {
      console.error('Error initiating payment:', error);
      throw new Error('Failed to initiate payment');
    }
  }

  /**
   * Verify payment signature and update order status
   */
  async verifyPayment(
    orderId: string,
    razorpayOrderId: string,
    razorpayPaymentId: string,
    razorpaySignature: string
  ): Promise<boolean> {
    try {
      // In production, verify signature on backend
      // For now, we'll update the order status
      const orderRef = doc(db, 'payments', orderId);
      const orderDoc = await getDoc(orderRef);

      if (!orderDoc.exists()) {
        throw new Error('Order not found');
      }

      // Update order with payment details
      await updateDoc(orderRef, {
        status: 'completed',
        razorpayOrderId,
        razorpayPaymentId,
        razorpaySignature,
        updatedAt: Timestamp.now(),
      });

      return true;
    } catch (error: any) {
      console.error('Error verifying payment:', error);
      
      // Mark order as failed
      try {
        const orderRef = doc(db, 'payments', orderId);
        await updateDoc(orderRef, {
          status: 'failed',
          updatedAt: Timestamp.now(),
        });
      } catch (updateError) {
        console.error('Error updating order status:', updateError);
      }

      return false;
    }
  }

  /**
   * Get payment order by ID
   */
  async getPaymentOrder(orderId: string): Promise<PaymentOrder | null> {
    try {
      const orderRef = doc(db, 'payments', orderId);
      const orderDoc = await getDoc(orderRef);

      if (!orderDoc.exists()) {
        return null;
      }

      return {
        id: orderDoc.id,
        ...orderDoc.data(),
        createdAt: orderDoc.data().createdAt?.toDate() || new Date(),
        updatedAt: orderDoc.data().updatedAt?.toDate() || new Date(),
      } as PaymentOrder;
    } catch (error: any) {
      console.error('Error getting payment order:', error);
      return null;
    }
  }
}

export const paymentService = new PaymentService();

