import { chromium, Browser, Page } from "playwright";
import { ProductDetails, OrderInfo } from "../types.js";

export async function extractProductDetails(
  url: string,
  headers: Record<string, string>
): Promise<ProductDetails> {
  let browser: Browser | null = null;

  try {
    console.log("🚀 Launching browser with signature headers...");

    browser = await chromium.launch({
      headless: true,
      args: [
        "--disable-web-security",
        "--disable-features=VizDisplayCompositor",
        "--ignore-certificate-errors",
        "--ignore-ssl-errors",
      ],
    });

    const context = await browser.newContext({
      extraHTTPHeaders: headers,
      ignoreHTTPSErrors: true,
      viewport: { width: 1280, height: 720 },
    });

    const page = await context.newPage();

    console.log("🔧 Browser context created with signature headers");
    console.log("📨 Signature Headers:");
    for (const [key, value] of Object.entries(headers)) {
      if (key === "Signature") {
        console.log(`   ${key}: ${value.substring(0, 20)}...`);
      } else {
        console.log(`   ${key}: ${value}`);
      }
    }

    // Navigate to URL
    console.log(`📍 Navigating to: ${url}`);
    await page.goto(url, { waitUntil: "domcontentloaded", timeout: 30000 });
    console.log("✅ Successfully navigated");

    // Wait for page to load
    await page.waitForTimeout(3000);

    // Extract product information
    const productInfo: Partial<ProductDetails> = {};

    // Common selectors for product title
    const titleSelectors = [
      "h1",
      '[data-testid="product-title"]',
      ".product-title",
      ".product-name",
      '[class*="title"]',
    ];

    // Extract product title
    for (const selector of titleSelectors) {
      try {
        const titleElement = await page.locator(selector).first();
        if (await titleElement.isVisible()) {
          const titleText = await titleElement.innerText();
          if (titleText && titleText.trim().length > 3) {
            productInfo.title = titleText.trim();
            console.log("📦 Product Title:", titleText.trim());
            break;
          }
        }
      } catch {
        continue;
      }
    }

    // Common selectors for product price
    const priceSelectors = [
      '[data-testid="price"]',
      ".price",
      ".product-price",
      '[class*="price"]',
      'span:has-text("$")',
      'span:has-text("€")',
      'span:has-text("£")',
    ];

    // Extract product price
    // First try specific selectors
for (const selector of priceSelectors) {
  try {
    const priceElement = await page.locator(selector).first();
    if (await priceElement.isVisible()) {
      const priceText = await priceElement.innerText();
      if (priceText && /[\$€£¥\d]/.test(priceText)) {
        productInfo.price = priceText.trim();
        console.log("💰 Product Price:", priceText.trim());
        break;
      }
    }
  } catch {
    continue;
  }
}

// Fallback: Search all page content (like Python version)
if (!productInfo.price) {
  try {
    const pageContent = await page.content(); // or use page.textContent('body')
    const pricePattern = /[\$€£¥]\s*\d+(?:[.,]\d{2})?|\d+(?:[.,]\d{2})?\s*[\$€£¥]/g;
    const matches = pageContent.match(pricePattern);
    if (matches && matches.length > 0) {
      productInfo.price = matches[0];
      console.log("💰 Found Price (fallback):", matches[0]);
    }
  } catch (error) {
    console.log("Could not extract price from page content");
  }
}

    // Fallback: try page title
    if (!productInfo.title) {
      const pageTitle = await page.title();
      if (pageTitle) {
        productInfo.title = pageTitle;
        console.log("📦 Page Title:", pageTitle);
      }
    }

    console.log("🛍️  PRODUCT EXTRACTION RESULTS");
    console.log("=".repeat(50));
    console.log("📦 Title:", productInfo.title || "❌ Not found");
    console.log("💰 Price:", productInfo.price || "❌ Not found");
    console.log("=".repeat(50));

    // Close browser
    await browser.close();

    return {
      title: productInfo.title,
      price: productInfo.price,
      url,
      extractionTime: new Date().toISOString(),
      extractionLog: "Product extraction completed successfully",
    };
  } catch (error: any) {
    console.error("❌ Product extraction error:", error.message);
    if (browser) {
      await browser.close();
    }
    throw error;
  }
}

export async function completeCheckout(
  productUrl: string,
  cartUrl: string,
  checkoutUrl: string,
  headers: Record<string, string>
): Promise<OrderInfo> {
  let browser: Browser | null = null;

  try {
    console.log("🛒 STARTING COMPLETE CHECKOUT PROCESS");
    console.log("=".repeat(50));
    console.log("📦 Product URL:", productUrl);
    console.log("🛒 Cart URL:", cartUrl);
    console.log("💳 Checkout URL:", checkoutUrl);
    console.log("=".repeat(50));

    browser = await chromium.launch({
      headless: true,
      args: [
        "--disable-web-security",
        "--disable-features=VizDisplayCompositor",
        "--ignore-certificate-errors",
        "--ignore-ssl-errors",
      ],
    });

    const context = await browser.newContext({
      extraHTTPHeaders: headers,
      ignoreHTTPSErrors: true,
      viewport: { width: 1280, height: 720 },
    });

    const page = await context.newPage();

    // STEP 1: Navigate to product page
    console.log("🛍️ STEP 1: Navigating to product page",productUrl);
    await page.goto(productUrl, {
      waitUntil: "domcontentloaded",
      timeout: 30000,
    });
    console.log("✅ Successfully navigated to product page");
    await page.waitForTimeout(3000);

    // STEP 2: Add to cart
    console.log('🛒 STEP 2: Looking for "Add to Cart" button');
    const addToCartSelectors = [
      'button:has-text("Add to Cart")',
      'button:has-text("Add To Cart")',
      'button:has-text("ADD TO CART")',
      '[data-testid="add-to-cart"]',
      '[id*="add-to-cart"]',
      ".add-to-cart",
      ".addToCart",
    ];

    let cartAdded = false;
    for (const selector of addToCartSelectors) {
      try {
        const button = page.locator(selector).first();
        if (await button.isVisible()) {
          console.log('🎯 Found "Add to Cart" button:', selector);
          await button.click();
          console.log('✅ Successfully clicked "Add to Cart"');
          cartAdded = true;
          break;
        }
      } catch {
        continue;
      }
    }

    if (cartAdded) {
      await page.waitForTimeout(2000);
      console.log("✅ Product added to cart");
    } else {
      console.log("⚠️ Could not add to cart, proceeding anyway");
    }

    // STEP 3: Navigate to cart
    console.log("🛒 STEP 3: Navigating to cart page",cartUrl);
    await page.goto(cartUrl, { waitUntil: "domcontentloaded", timeout: 30000 });
    console.log("✅ Successfully navigated to cart page");
    await page.waitForTimeout(3000);

    // STEP 4: Proceed to checkout
    console.log('➡️ STEP 4: Looking for "Proceed to Checkout" button');
    const proceedSelectors = [
      'button:has-text("Proceed to Checkout")',
      'button:has-text("Checkout")',
      'a:has-text("Checkout")',
      '[data-testid="proceed-to-checkout"]',
      '[data-testid="checkout"]',
      ".checkout-btn",
      "#checkout",
    ];

    let checkoutProceeded = false;
    for (const selector of proceedSelectors) {
      try {
        const button = page.locator(selector).first();
        if (await button.isVisible()) {
          console.log('🎯 Found "Proceed to Checkout" button:', selector);
          await button.click();
          console.log('✅ Successfully clicked "Proceed to Checkout"');
          checkoutProceeded = true;
          break;
        }
      } catch {
        continue;
      }
    }

    if (checkoutProceeded) {
      await page.waitForTimeout(3000);
      console.log("✅ Successfully proceeded to checkout");
    } else {
      console.log("⚠️ Could not proceed, navigating directly to checkout");
      await page.goto(checkoutUrl, {
        waitUntil: "domcontentloaded",
        timeout: 30000,
      });
    }

    console.log("✅ Now on checkout page:", page.url());
    await page.waitForTimeout(3000);

    // STEP 5: Fill checkout form
    console.log("📝 STEP 5: Filling checkout form");
    const checkoutData = {
      email: "john.doe@example.com",
      phone: "+1-555-0123",
      firstName: "John",
      lastName: "Doe",
      company: "Example Company Inc.",
      address1: "123 Main Street",
      address2: "Suite 456",
      city: "New York",
      state: "NY",
      zipCode: "10001",
      country: "United States",
      cardNumber: "4111111111111111",
      expiryDate: "12/25",
      cvv: "123",
      nameOnCard: "John Doe",
      specialInstructions:
        "Ed25519 Base58 signature authentication sample order",
    };

    const formSelectors: Record<string, string[]> = {
      email: ["#email", '[name="email"]', '[type="email"]'],
      phone: ["#phone", '[name="phone"]', '[type="tel"]'],
      firstName: ["#firstName", '[name="firstName"]'],
      lastName: ["#lastName", '[name="lastName"]'],
      address1: ["#address1", '[name="address1"]'],
      city: ["#city", '[name="city"]'],
      state: ["#state", '[name="state"]'],
      zipCode: ["#zipCode", "#zip", '[name="zip"]'],
      country: ["#country", '[name="country"]'],
      cardNumber: ["#cardNumber", '[name="cardNumber"]'],
      expiryDate: ["#expiryDate", '[name="expiryDate"]'],
      cvv: ["#cvv", '[name="cvv"]'],
      nameOnCard: ["#nameOnCard", '[name="nameOnCard"]'],
      specialInstructions: [
        "#specialInstructions",
        '[name="specialInstructions"]',
      ],
    };

    let fieldsFilled = 0;
    for (const [field, value] of Object.entries(checkoutData)) {
      const selectors =
        formSelectors[field as keyof typeof formSelectors] || [];
      for (const selector of selectors) {
        try {
          const element = page.locator(selector).first();
          if ((await element.isVisible()) && (await element.isEnabled())) {
            await element.fill(String(value));
            console.log(`✅ Filled ${field}:`, value);
            fieldsFilled++;
            break;
          }
        } catch {
          continue;
        }
      }
    }

    console.log(`📊 Successfully filled ${fieldsFilled} fields`);
    await page.waitForTimeout(3000);

    // STEP 6: Submit order
    console.log("🔄 Looking for submit button");
    const submitSelectors = [
      'button[type="submit"]',
      'button:has-text("Complete Order")',
      'button:has-text("Place Order")',
      '[data-testid="submit-order"]',
    ];

    let submitClicked = false;
    for (const selector of submitSelectors) {
      try {
        const button = page.locator(selector).first();
        if ((await button.isVisible()) && (await button.isEnabled())) {
          console.log("🎯 Found submit button:", selector);
          await button.click();
          console.log("✅ Successfully clicked submit");
          submitClicked = true;
          break;
        }
      } catch {
        continue;
      }
    }

    if (submitClicked) {
      await page.waitForTimeout(5000);

      // Extract order ID
      let orderId: string | undefined;
      try {
        const orderSelectors = [
          'span:has-text("Order #")',
          '[data-testid*="order"]',
          ".order-number",
        ];

        for (const selector of orderSelectors) {
          try {
            const element = page.locator(selector).first();
            if (await element.isVisible()) {
              const text = await element.innerText();
              const match = text.match(/([A-Z0-9-]+)/);
              if (match) {
                orderId = match[1];
                console.log("✅ Extracted order ID:", orderId);
                break;
              }
            }
          } catch {
            continue;
          }
        }
      } catch (error) {
        console.log("⚠️ Could not extract order ID");
      }

      await browser.close();

      return {
        orderId,
        successPageUrl: page.url(),
        timestamp: new Date().toISOString(),
      };
    } else {
      console.log("❌ Could not submit order");
      await browser.close();

      return {
        error: "Could not submit order",
        finalUrl: page.url(),
        timestamp: new Date().toISOString(),
      };
    }
  } catch (error: any) {
    console.error("❌ Checkout error:", error.message);
    if (browser) {
      await browser.close();
    }
    throw error;
  }
}
