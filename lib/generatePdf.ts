import fs from "fs";
import handlebars from "handlebars";
import path from "path";
import puppeteer from "puppeteer";

// Registre o helper 'add' antes de usar o template
handlebars.registerHelper("add", function (a: number) {
  return a + 0;
});
handlebars.registerHelper("extenso", function (a: number) {
  return a + 0;
});

export const generatePdf = async (data: any): Promise<Buffer> => {
  try {
    const htmlTemplate = await fs.promises.readFile(
      path.join(process.cwd(), "public", "templates", "proposal.html"),
      "utf-8"
    );
    const template = handlebars.compile(htmlTemplate);
    const filledHTML = template(data);

    const browser = await puppeteer.launch();
    const page = await browser.newPage();
    await page.setContent(filledHTML, { waitUntil: "networkidle0" });

    await page.evaluate(() => {
      const baseElement = document.querySelector("base");
      if (baseElement) {
        baseElement.href = "http://localhost:3000/";
      }
    });

    const pdfBuffer = await page.pdf({
      format: "A4",
      printBackground: true,
      margin: { top: "1cm", right: "1cm", bottom: "1cm", left: "1cm" },
      preferCSSPageSize: true,
    });

    await browser.close();

    return Buffer.from(pdfBuffer);
  } catch (error) {
    console.error("Error generating PDF:", error);
    throw new Error("Failed to generate PDF. Please try again.");
  }
};

export default generatePdf;
