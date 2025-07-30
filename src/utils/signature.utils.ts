import crypto from "crypto";
import { config } from "../config/env.config";

export class SignatureUtils {
  /**
   * Verify Freemius signature
   * @param url - The full URL without signature
   * @param providedSignature - The signature from query parameters
   * @param secretKey - The product secret key
   * @returns boolean indicating if signature is valid
   */
  static verifyFreemiusSignature(
    url: string,
    providedSignature: string,
    secretKey: string
  ): boolean {
    try {
      // Calculate HMAC SHA256
      const calculatedSignature = crypto
        .createHmac("sha256", secretKey)
        .update(url)
        .digest("hex");

      // Compare signatures using timing-safe comparison
      return crypto.timingSafeEqual(
        Buffer.from(calculatedSignature, "hex"),
        Buffer.from(providedSignature, "hex")
      );
    } catch (error) {
      console.error("Error verifying signature:", error);
      return false;
    }
  }

  /**
   * Clean URL by removing signature parameter
   * @param fullUrl - The complete URL with signature
   * @returns Clean URL without signature
   */
  static cleanUrl(fullUrl: string): string {
    const signatureIndex = fullUrl.indexOf("&signature=");
    if (signatureIndex === -1) {
      return fullUrl;
    }
    return fullUrl.substring(0, signatureIndex);
  }

  /**
   * Verify Freemius webhook/redirect signature
   * @param req - Express request object
   * @returns boolean indicating if signature is valid
   */
  static verifyFreemiusRequest(req: any): boolean {
    const signature = req.query.signature;
    if (!signature) {
      console.error("No signature provided");
      return false;
    }

    // Get the current URL
    const protocol = req.protocol;
    const host = req.get("host");
    const originalUrl = req.originalUrl;
    const fullUrl = `${protocol}://${host}${originalUrl}`;

    // Clean the URL (remove signature)
    const cleanUrl = this.cleanUrl(fullUrl);

    // Get secret key from config
    const secretKey = config.freemius.productSecretKey;
    if (!secretKey) {
      console.error("Freemius product secret key not configured");
      return false;
    }

    // For debugging - let's see what we're working with
    console.log("=== SIGNATURE DEBUG ===");
    console.log("Original URL:", fullUrl);
    console.log("Clean URL:", cleanUrl);
    console.log("Signature:", signature);
    console.log(
      "Secret Key:",
      secretKey ? `${secretKey.substring(0, 8)}...` : "NOT SET"
    );

    // Calculate what the signature should be
    const calculatedSignature = crypto
      .createHmac("sha256", secretKey)
      .update(cleanUrl)
      .digest("hex");

    console.log("Calculated signature:", calculatedSignature);
    console.log("Provided signature:", signature);
    console.log("Signatures match:", calculatedSignature === signature);
    console.log("=======================");

    return this.verifyFreemiusSignature(cleanUrl, signature, secretKey);
  }
}
