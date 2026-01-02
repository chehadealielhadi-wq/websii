import ExcelJS from "exceljs";

export const exportToExcel = async (bookings) => {
  const workbook = new ExcelJS.Workbook();
  const worksheet = workbook.addWorksheet("Bookings");

  worksheet.columns = [
    { header: "ID", key: "id", width: 15 },
    { header: "Name", key: "name", width: 20 },
    { header: "Phone", key: "phone", width: 15 },
    { header: "Date", key: "date", width: 15 },
    { header: "Nights", key: "nights", width: 10 },
  ];

  bookings.forEach((b) => worksheet.addRow(b));

  const buffer = await workbook.writeBuffer();
  return buffer;
};
