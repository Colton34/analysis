/*The MIT License (MIT)

Copyright (c) 2014 https://github.com/kayalshri/

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in
all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
THE SOFTWARE.*/

export function tableExport(options) {

jQuery.base64 = (function($) {

    // private property
    var keyStr = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/=";

    // private method for UTF-8 encoding
    function utf8Encode(string) {
        string = string.replace(/\r\n/g,"\n");
        var utftext = "";
        for (var n = 0; n < string.length; n++) {
            var c = string.charCodeAt(n);
            if (c < 128) {
                utftext += String.fromCharCode(c);
            }
            else if((c > 127) && (c < 2048)) {
                utftext += String.fromCharCode((c >> 6) | 192);
                utftext += String.fromCharCode((c & 63) | 128);
            }
            else {
                utftext += String.fromCharCode((c >> 12) | 224);
                utftext += String.fromCharCode(((c >> 6) & 63) | 128);
                utftext += String.fromCharCode((c & 63) | 128);
            }
        }
        return utftext;
    }

    function encode(input) {
        var output = "";
        var chr1, chr2, chr3, enc1, enc2, enc3, enc4;
        var i = 0;
        input = utf8Encode(input);
        while (i < input.length) {
            chr1 = input.charCodeAt(i++);
            chr2 = input.charCodeAt(i++);
            chr3 = input.charCodeAt(i++);
            enc1 = chr1 >> 2;
            enc2 = ((chr1 & 3) << 4) | (chr2 >> 4);
            enc3 = ((chr2 & 15) << 2) | (chr3 >> 6);
            enc4 = chr3 & 63;
            if (isNaN(chr2)) {
                enc3 = enc4 = 64;
            } else if (isNaN(chr3)) {
                enc4 = 64;
            }
            output = output +
                keyStr.charAt(enc1) + keyStr.charAt(enc2) +
                keyStr.charAt(enc3) + keyStr.charAt(enc4);
        }
        return output;
    }

    return {
        encode: function (str) {
            return encode(str);
        }
    };

}(jQuery));


    var defaults = {
            separator: ',',
            ignoreColumn: [],
            tableName:'yourTableName',
            type:'csv',
            pdfFontSize:14,
            pdfLeftMargin:20,
            escape:'true',
            htmlContent:'false',
            consoleLog:'false'
    };

    options = $.extend(defaults, options);
    var el = this;

    if(options.type == 'csv' || options.type == 'txt'){

        // Header
        var tdData ="";
        $(el).find('thead').find('tr').each(function() {
        tdData += "\n";
            $(this).filter(':visible').find('th').each(function(index,data) {
                if ($(this).css('display') != 'none'){
                    if(options.ignoreColumn.indexOf(index) == -1){
                        tdData += '"' + parseString($(this)) + '"' + options.separator;
                    }
                }

            });
            tdData = $.trim(tdData);
            tdData = $.trim(tdData).substring(0, tdData.length -1);
        });

        // Row vs Column
        $(el).find('tbody').find('tr').each(function() {
        tdData += "\n";
            $(this).filter(':visible').find('td').each(function(index,data) {
                if ($(this).css('display') != 'none'){
                    if(options.ignoreColumn.indexOf(index) == -1){
                        tdData += '"'+ parseString($(this)) + '"'+ options.separator;
                    }
                }
            });
            //tdData = $.trim(tdData);
            tdData = $.trim(tdData).substring(0, tdData.length -1);
        });

        //output
        if(options.consoleLog == 'true'){
            console.log(tdData);
        }
        var base64data = "base64," + $.base64.encode(tdData);
        console.log('下载啦啦啦');
        window.open('data:text/csv'+';filename=exportData;' + base64data);
    }else if(options.type == 'sql'){

        // Header
        var tdData ="INSERT INTO `"+options.tableName+"` (";
        $(el).find('thead').find('tr').each(function() {

            $(this).filter(':visible').find('th').each(function(index,data) {
                if ($(this).css('display') != 'none'){
                    if(options.ignoreColumn.indexOf(index) == -1){
                        tdData += '`' + parseString($(this)) + '`,' ;
                    }
                }

            });
            tdData = $.trim(tdData);
            tdData = $.trim(tdData).substring(0, tdData.length -1);
        });
        tdData += ") VALUES ";
        // Row vs Column
        $(el).find('tbody').find('tr').each(function() {
        tdData += "(";
            $(this).filter(':visible').find('td').each(function(index,data) {
                if ($(this).css('display') != 'none'){
                    if(options.ignoreColumn.indexOf(index) == -1){
                        tdData += '"'+ parseString($(this)) + '",';
                    }
                }
            });

            tdData = $.trim(tdData).substring(0, tdData.length -1);
            tdData += "),";
        });
        tdData = $.trim(tdData).substring(0, tdData.length -1);
        tdData += ";";

        //output
        //console.log(tdData);

        if(options.consoleLog == 'true'){
            console.log(tdData);
        }

        var base64data = "base64," + $.base64.encode(tdData);
        window.open('data:application/sql;filename=exportData;' + base64data);


    }else if(options.type == 'json'){

        var jsonHeaderArray = [];
        $(el).find('thead').find('tr').each(function() {
            var tdData ="";
            var jsonArrayTd = [];

            $(this).filter(':visible').find('th').each(function(index,data) {
                if ($(this).css('display') != 'none'){
                    if(options.ignoreColumn.indexOf(index) == -1){
                        jsonArrayTd.push(parseString($(this)));
                    }
                }
            });
            jsonHeaderArray.push(jsonArrayTd);

        });

        var jsonArray = [];
        $(el).find('tbody').find('tr').each(function() {
            var tdData ="";
            var jsonArrayTd = [];

            $(this).filter(':visible').find('td').each(function(index,data) {
                if ($(this).css('display') != 'none'){
                    if(options.ignoreColumn.indexOf(index) == -1){
                        jsonArrayTd.push(parseString($(this)));
                    }
                }
            });
            jsonArray.push(jsonArrayTd);

        });

        var jsonExportArray =[];
        jsonExportArray.push({header:jsonHeaderArray,data:jsonArray});

        //Return as JSON
        //console.log(JSON.stringify(jsonExportArray));

        //Return as Array
        //console.log(jsonExportArray);
        if(options.consoleLog == 'true'){
            console.log(JSON.stringify(jsonExportArray));
        }
        var base64data = "base64," + $.base64.encode(JSON.stringify(jsonExportArray));
        window.open('data:application/json;filename=exportData;' + base64data);
    }else if(options.type == 'xml'){

        var xml = '<?xml version="1.0" encoding="utf-8"?>';
        xml += '<tabledata><fields>';

        // Header
        $(el).find('thead').find('tr').each(function() {
            $(this).filter(':visible').find('th').each(function(index,data) {
                if ($(this).css('display') != 'none'){
                    if(options.ignoreColumn.indexOf(index) == -1){
                        xml += "<field>" + parseString($(this)) + "</field>";
                    }
                }
            });
        });
        xml += '</fields><data>';

        // Row Vs Column
        var rowCount=1;
        $(el).find('tbody').find('tr').each(function() {
            xml += '<row id="'+rowCount+'">';
            var colCount=0;
            $(this).filter(':visible').find('td').each(function(index,data) {
                if ($(this).css('display') != 'none'){
                    if(options.ignoreColumn.indexOf(index) == -1){
                        xml += "<column-"+colCount+">"+parseString($(this))+"</column-"+colCount+">";
                    }
                }
                colCount++;
            });
            rowCount++;
            xml += '</row>';
        });
        xml += '</data></tabledata>'

        if(options.consoleLog == 'true'){
            console.log(xml);
        }

        var base64data = "base64," + $.base64.encode(xml);
        window.open('data:application/xml;filename=exportData;' + base64data);

    }else if(options.type == 'excel' || options.type == 'doc'|| options.type == 'powerpoint'  ){
        //console.log($(this).html());
        var excel="<table>";
        // Header
        $(el).find('thead').find('tr').each(function() {
            excel += "<tr>";
            $(this).filter(':visible').find('th').each(function(index,data) {
                if ($(this).css('display') != 'none'){
                    if(options.ignoreColumn.indexOf(index) == -1){
                        excel += "<td>" + parseString($(this))+ "</td>";
                    }
                }
            });
            excel += '</tr>';

        });


        // Row Vs Column
        var rowCount=1;
        $(el).find('tbody').find('tr').each(function() {
            excel += "<tr>";
            var colCount=0;
            $(this).filter(':visible').find('td').each(function(index,data) {
                if ($(this).css('display') != 'none'){
                    if(options.ignoreColumn.indexOf(index) == -1){
                        excel += "<td>"+parseString($(this))+"</td>";
                    }
                }
                colCount++;
            });
            rowCount++;
            excel += '</tr>';
        });
        excel += '</table>'

        if(options.consoleLog == 'true'){
            console.log(excel);
        }

        var excelFile = "<html xmlns:o='urn:schemas-microsoft-com:office:office' xmlns:x='urn:schemas-microsoft-com:office:"+options.type+"' xmlns='http://www.w3.org/TR/REC-html40'>";
        excelFile += "<head>";
        excelFile += "<!--[if gte mso 9]>";
        excelFile += "<xml>";
        excelFile += "<x:ExcelWorkbook>";
        excelFile += "<x:ExcelWorksheets>";
        excelFile += "<x:ExcelWorksheet>";
        excelFile += "<x:Name>";
        excelFile += "{worksheet}";
        excelFile += "</x:Name>";
        excelFile += "<x:WorksheetOptions>";
        excelFile += "<x:DisplayGridlines/>";
        excelFile += "</x:WorksheetOptions>";
        excelFile += "</x:ExcelWorksheet>";
        excelFile += "</x:ExcelWorksheets>";
        excelFile += "</x:ExcelWorkbook>";
        excelFile += "</xml>";
        excelFile += "<![endif]-->";
        excelFile += "</head>";
        excelFile += "<body>";
        excelFile += excel;
        excelFile += "</body>";
        excelFile += "</html>";

        var base64data = "base64," + $.base64.encode(excelFile);
        window.open('data:application/vnd.ms-'+options.type+';filename=exportData.doc;' + base64data);

    }else if(options.type == 'png'){
        html2canvas($(el), {
            onrendered: function(canvas) {
                var img = canvas.toDataURL("image/png");
                window.open(img);


            }
        });
    }else if(options.type == 'pdf'){

        var doc = new jsPDF('p','pt', 'a4', true);
        doc.setFontSize(options.pdfFontSize);

        // Header
        var startColPosition=options.pdfLeftMargin;
        $(el).find('thead').find('tr').each(function() {
            $(this).filter(':visible').find('th').each(function(index,data) {
                if ($(this).css('display') != 'none'){
                    if(options.ignoreColumn.indexOf(index) == -1){
                        var colPosition = startColPosition+ (index * 50);
                        doc.text(colPosition,20, parseString($(this)));
                    }
                }
            });
        });


        // Row Vs Column
        var startRowPosition = 20; var page =1;var rowPosition=0;
        $(el).find('tbody').find('tr').each(function(index,data) {
            rowCalc = index+1;

        if (rowCalc % 26 == 0){
            doc.addPage();
            page++;
            startRowPosition=startRowPosition+10;
        }
        rowPosition=(startRowPosition + (rowCalc * 10)) - ((page -1) * 280);

            $(this).filter(':visible').find('td').each(function(index,data) {
                if ($(this).css('display') != 'none'){
                    if(options.ignoreColumn.indexOf(index) == -1){
                        var colPosition = startColPosition+ (index * 50);
                        doc.text(colPosition,rowPosition, parseString($(this)));
                    }
                }

            });

        });

        // Output as Data URI
        doc.output('datauri');

    }


    function parseString(data){
        var content_data;
        if(options.htmlContent == 'true'){
            content_data = data.html().trim();
        }else{
            content_data = data.text().trim();
        }

        if(options.escape == 'true'){
            content_data = escape(content_data);
        }



        return content_data;
    }

}

