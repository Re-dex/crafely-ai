#!/usr/bin/env node

/**
 * Cleanup script for temporary upload files
 * This script removes any leftover temporary files from the tmp/uploads directory
 */

const fs = require("fs");
const path = require("path");

const uploadDir = path.resolve(process.cwd(), "tmp", "uploads");

function cleanupTempFiles() {
  try {
    if (!fs.existsSync(uploadDir)) {
      console.log("📁 Upload directory does not exist:", uploadDir);
      return;
    }

    const files = fs.readdirSync(uploadDir);

    if (files.length === 0) {
      console.log("✅ No temporary files to clean up");
      return;
    }

    let cleanedCount = 0;
    let errorCount = 0;

    files.forEach((file) => {
      const filePath = path.join(uploadDir, file);

      try {
        const stats = fs.statSync(filePath);

        if (stats.isFile()) {
          fs.unlinkSync(filePath);
          console.log(`🗑️  Deleted: ${file}`);
          cleanedCount++;
        }
      } catch (error) {
        console.error(`❌ Error deleting ${file}:`, error.message);
        errorCount++;
      }
    });

    console.log(`\n📊 Cleanup Summary:`);
    console.log(`   ✅ Files deleted: ${cleanedCount}`);
    console.log(`   ❌ Errors: ${errorCount}`);
    console.log(`   📁 Directory: ${uploadDir}`);
  } catch (error) {
    console.error("❌ Cleanup failed:", error.message);
    process.exit(1);
  }
}

// Run cleanup
console.log("🧹 Starting temporary file cleanup...\n");
cleanupTempFiles();
console.log("\n✨ Cleanup completed!");
