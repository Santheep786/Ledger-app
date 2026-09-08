/**
 * FARM ERP — WEB APP BACKEND
 * ==========================
 * Deploy this as a Web App (Deploy > New deployment > Web app) and share
 * the resulting URL with your family. They open it like any website —
 * no need to touch the spreadsheet directly. Everything they submit is
 * written straight into this same Google Sheet.
 *
 * SETUP:
 * 1. Open your Google Sheet (the one converted from the Excel workbook).
 * 2. Extensions > Apps Script.
 * 3. Delete anything in the default Code.gs, paste this whole file in.
 * 4. Click the + next to "Files" > HTML > name it exactly "Form" > paste
 *    in the contents of Form.html (the other file provided).
 * 5. Click Deploy > New deployment > select type "Web app".
 *      - Execute as: Me
 *      - Who has access: "Anyone with Google account" (recommended) or
 *        "Anyone" if you want family members without Gmail to use it too.
 * 6. Click Deploy, authorize when prompted, copy the Web App URL.
 * 7. Share that URL with your family — bookmark it like a website.
 *
 * Whenever you edit this code, you must create a NEW deployment version
 * (Deploy > Manage deployments > edit > New version) for changes to go live.
 */

// ---- Sheet name constants — must match your spreadsheet's tab names exactly ----
const SHEETS = {
  INCOME: 'Income',
  EXPENSES: 'Expenses',
  PRODUCTION: 'Production Log',
  ANIMALS: 'Animal Register',
  BATCHES: 'Batch Register',
  SETUP: 'Setup'
};

// ---- Animal Register species blocks (row ranges) ----
const ANIMAL_BLOCKS = {
  'Goat': { start: 5, end: 79 },
  'Cow':  { start: 80, end: 109 },
  'Hen':  { start: 110, end: 149 }
};

const LOG_START_ROW = 5;
const LOG_END_ROW = 503;

/**
 * Serves the web form when someone visits the Web App URL.
 */
function doGet() {
  return HtmlService.createHtmlOutputFromFile('Form')
    .setTitle('Farm Quick Entry')
    .addMetaTag('viewport', 'width=device-width, initial-scale=1');
}

/**
 * Returns everything the form needs to populate its dropdowns.
 * Called once when the page loads.
 */
function getFormData() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const setup = ss.getSheetByName(SHEETS.SETUP);
  const batchSheet = ss.getSheetByName(SHEETS.BATCHES);

  const colValues = (sheet, a1Range) =>
    sheet.getRange(a1Range).getValues().flat().filter(v => v !== '' && v !== null);

  return {
    animalTypes: colValues(setup, 'A7:A10'),
    expenseCats: colValues(setup, 'C7:C16'),
    incomeCats: colValues(setup, 'E7:E12'),
    paymentModes: colValues(setup, 'G7:G10'),
    productTypes: colValues(setup, 'K7:K10'),
    genders: colValues(setup, 'T7:T8'),
    purposes: colValues(setup, 'U7:U11'),
    batches: colValues(batchSheet, 'A5:A19')
  };
}

/**
 * Returns Animal IDs matching a Type + Batch, restricted to Active status.
 * Called whenever the user changes the Type or Batch dropdown on the form.
 */
function getFilteredAnimals(animalType, batch) {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const sheet = ss.getSheetByName(SHEETS.ANIMALS);
  const data = sheet.getRange(5, 1, 145, 8).getValues(); // A:H, rows 5-149

  const results = [];
  data.forEach(row => {
    const [id, type, batchTag, , , , , status] = row;
    if (!id) return;
    if (type !== animalType) return;
    if (batch && batchTag !== batch) return;
    if (status !== 'Active') return;
    results.push(id);
  });
  return results;
}

/**
 * Main submission handler — called when the family member clicks Submit.
 * Mirrors the validation and routing logic of the original AddEntry macro.
 */
function submitEntry(form) {
  try {
    validateRequired(form);

    if (form.entryType === 'Animal Register') {
      return addAnimal(form);
    }
    return addLogEntry(form);

  } catch (err) {
    return { success: false, message: err.message };
  }
}

function validateRequired(form) {
  const need = (val, label) => {
    if (val === undefined || val === null || String(val).trim() === '') {
      throw new Error('Please fill in: ' + label);
    }
  };
  need(form.entryType, 'Entry Type');
  need(form.date, 'Date');
  need(form.animalType, 'Animal / Farm Type');

  if (form.entryType !== 'Animal Register') {
    need(form.category, 'Category / Product');
  }
  need(form.amount, 'Amount / Quantity / Acquisition Cost');

  if (form.entryType === 'Income' || form.entryType === 'Expense') {
    need(form.paymentMode, 'Payment Mode');
  }
  if (form.entryType === 'Animal Register') {
    need(form.animalId, 'Animal ID (the new animal\u2019s ID)');
  }
}

/**
 * Handles Entry Type = "Animal Register": finds the correct species block,
 * rejects duplicate IDs, and writes the new animal's row.
 */
function addAnimal(form) {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const sheet = ss.getSheetByName(SHEETS.ANIMALS);

  const block = ANIMAL_BLOCKS[form.animalType];
  if (!block) {
    throw new Error('Animal / Farm Type must be Goat, Cow, or Hen to add to the register.');
  }

  // Reject duplicate Animal ID anywhere in the register
  const allIds = sheet.getRange(5, 1, 145, 1).getValues().flat();
  if (allIds.includes(form.animalId)) {
    throw new Error('Animal ID "' + form.animalId + '" already exists. Use a unique ID.');
  }

  // Find first empty row within that species' block
  const blockSize = block.end - block.start + 1;
  const idColumn = sheet.getRange(block.start, 1, blockSize, 1).getValues().flat();
  const emptyIndex = idColumn.findIndex(v => v === '' || v === null);
  if (emptyIndex === -1) {
    throw new Error('The ' + form.animalType + ' section of Animal Register is full (rows ' +
      block.start + '-' + block.end + '). Ask for more rows to be added.');
  }
  const targetRow = block.start + emptyIndex;

  sheet.getRange(targetRow, 1).setValue(form.animalId);          // A: Animal ID
  sheet.getRange(targetRow, 2).setValue(form.animalType);        // B: Type
  sheet.getRange(targetRow, 3).setValue(form.batch || '');       // C: Name / Batch Tag
  sheet.getRange(targetRow, 4).setValue(form.breed || '');       // D: Breed
  sheet.getRange(targetRow, 5).setValue(1);                      // E: Qty
  sheet.getRange(targetRow, 6).setValue(new Date(form.date));    // F: Date Acquired
  sheet.getRange(targetRow, 7).setValue(Number(form.amount));    // G: Acquisition Cost
  sheet.getRange(targetRow, 8).setValue('Active');                // H: Status
  if (form.usefulLife) sheet.getRange(targetRow, 11).setValue(Number(form.usefulLife)); // K
  if (form.salvageValue) sheet.getRange(targetRow, 12).setValue(Number(form.salvageValue)); // L
  sheet.getRange(targetRow, 18).setValue(form.notes || '');      // R: Notes
  sheet.getRange(targetRow, 19).setValue(form.gender || '');     // S: Gender
  sheet.getRange(targetRow, 20).setValue(form.purpose || '');    // T: Purpose
  if (form.ageAtAcquisition) sheet.getRange(targetRow, 21).setValue(Number(form.ageAtAcquisition)); // U

  return {
    success: true,
    message: 'Added ' + form.animalId + ' to Animal Register, row ' + targetRow + '.'
  };
}

/**
 * Handles Entry Type = Income / Expense / Production Log: finds the first
 * empty row (5-503) and writes the entry. The sheet's own formulas
 * (Batch auto-lookup, and the Goat/Hen/Cow expense grids) pick this up
 * automatically — nothing else to do here.
 */
function addLogEntry(form) {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  let sheetName;
  if (form.entryType === 'Income') sheetName = SHEETS.INCOME;
  else if (form.entryType === 'Expense') sheetName = SHEETS.EXPENSES;
  else if (form.entryType === 'Production Log') sheetName = SHEETS.PRODUCTION;
  else throw new Error('Unknown Entry Type: ' + form.entryType);

  const sheet = ss.getSheetByName(sheetName);

  const idColumn = sheet.getRange(LOG_START_ROW, 1, LOG_END_ROW - LOG_START_ROW + 1, 1)
    .getValues().flat();
  const emptyIndex = idColumn.findIndex(v => v === '' || v === null);
  if (emptyIndex === -1) {
    throw new Error('This sheet\u2019s data area (rows 5-503) is full. Ask for more rows to be added to ' + sheetName + '.');
  }
  const targetRow = LOG_START_ROW + emptyIndex;

  // Animal ID(s) field wins if filled in; otherwise fall back to the whole Batch
  const animalField = form.animalId ? form.animalId : (form.batch || '');

  if (form.entryType === 'Production Log') {
    sheet.getRange(targetRow, 1).setValue(new Date(form.date)); // Date
    sheet.getRange(targetRow, 2).setValue(animalField);          // Animal ID
    sheet.getRange(targetRow, 4).setValue(form.category);        // Product
    sheet.getRange(targetRow, 5).setValue(Number(form.amount));  // Quantity
    sheet.getRange(targetRow, 7).setValue(form.notes || '');     // Notes
  } else {
    sheet.getRange(targetRow, 1).setValue(new Date(form.date));  // Date
    sheet.getRange(targetRow, 2).setValue(animalField);           // Animal ID(s) or Batch
    sheet.getRange(targetRow, 3).setValue(form.animalType);       // Animal / Farm Type
    sheet.getRange(targetRow, 4).setValue(form.category);         // Category
    sheet.getRange(targetRow, 5).setValue(form.description || '');// Description
    sheet.getRange(targetRow, 6).setValue(Number(form.amount));   // Amount
    sheet.getRange(targetRow, 7).setValue(form.paymentMode || '');// Payment Mode
    sheet.getRange(targetRow, 8).setValue(form.notes || '');      // Notes
  }

  return {
    success: true,
    message: 'Added to ' + sheetName + ', row ' + targetRow + '.'
  };
}
