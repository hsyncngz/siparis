function doPost(e) {
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var sheet = ss.getSheets()[0]; // Borç bilgilerinin olduğu sayfa
  
  try {
    var data = JSON.parse(e.postData.contents);
    
    // İŞLEM 1: TALEP KAYDETME (Arıza Bildirimi)
    if (data.islem === "talepKaydet") {
      var talepSheet = ss.getSheetByName("Talepler");
      if (!talepSheet) {
        talepSheet = ss.insertSheet("Talepler");
        talepSheet.appendRow(["Daire No", "Konu", "Mesaj", "Tarih"]);
      }
      talepSheet.appendRow([data.daireNo, data.konu, data.mesaj, new Date()]);
      return ContentService.createTextOutput("Talep Kaydedildi");
    }

    // İŞLEM 2: GİRİŞ LOGLARI (Opsiyonel - Daha önce konuştuğumuz sayaç için)
    var dNo = String(data.daireNo);
    var rows = sheet.getDataRange().getValues();
    var headers = rows[0];
    var dCol = headers.indexOf("daireNo");
    
    for (var i = 1; i < rows.length; i++) {
      if (String(rows[i][dCol]) === dNo) {
        var zaman = new Date();
        // Sütun başlıklarınıza göre (7. sütun başarılı, 8. başarısız gibi) güncellenebilir
        if (data.durum === "basarili") sheet.getRange(i + 1, 7).setValue(zaman);
        else sheet.getRange(i + 1, 8).setValue(zaman);
        return ContentService.createTextOutput("Log Tamam");
      }
    }
    
  } catch (err) {
    return ContentService.createTextOutput("Hata: " + err.message);
  }
}
