import fs from 'fs';
import path from 'path';
import JSZip from 'jszip';

async function generatePowerBiFiles() {
  const zip = new JSZip();

  // 1. [Content_Types].xml
  const contentTypesXml = `<?xml version="1.0" encoding="utf-8"?>
<Types xmlns="http://schemas.openxmlformats.org/package/2006/content-types">
  <Default Extension="json" ContentType="application/json" />
  <Default Extension="xml" ContentType="application/xml" />
  <Override PartName="/Version" ContentType="application/json" />
  <Override PartName="/Settings" ContentType="application/json" />
  <Override PartName="/Metadata" ContentType="application/json" />
  <Override PartName="/DataModelSchema" ContentType="application/json" />
  <Override PartName="/DiagramLayout" ContentType="application/json" />
  <Override PartName="/Report/Layout" ContentType="application/json" />
</Types>`;
  zip.file('[Content_Types].xml', contentTypesXml);

  // 2. Version
  zip.file('Version', '1.28');

  // 3. Settings
  const settingsJson = {
    version: '1.0',
    locale: 'en-US',
    queryOptions: {
      enablePreviewFeatures: true,
      dataPrivacy: 'Organizational'
    }
  };
  zip.file('Settings', JSON.stringify(settingsJson, null, 2));

  // 4. Metadata
  const metadataJson = {
    name: 'Sales Performance Analytics',
    author: 'Basavaraj Agali',
    createdTimestamp: '2026-10-23T04:30:00Z',
    description: 'Executive Sales & Profitability Dashboard featuring Kimball Star Schema, Power Query ETL, and DAX Time Intelligence.',
    version: '2.0.0'
  };
  zip.file('Metadata', JSON.stringify(metadataJson, null, 2));

  // 5. DataModelSchema (Tabular Model Schema)
  const dataModelSchema = {
    name: 'SalesPerformanceModel',
    compatibilityLevel: 1550,
    model: {
      culture: 'en-US',
      dataAccessOptions: {
        legacyRedirects: true,
        returnErrorValuesAsNull: true
      },
      tables: [
        {
          name: 'Fact_Sales',
          columns: [
            { name: 'Row_ID', dataType: 'int64', isHidden: true },
            { name: 'Order_ID', dataType: 'string' },
            { name: 'Order_Date', dataType: 'dateTime', formatString: 'yyyy-MM-dd' },
            { name: 'Ship_Date', dataType: 'dateTime', formatString: 'yyyy-MM-dd' },
            { name: 'Ship_Mode', dataType: 'string' },
            { name: 'Customer_ID', dataType: 'string' },
            { name: 'Postal_Code', dataType: 'string' },
            { name: 'Product_ID', dataType: 'string' },
            { name: 'Sales', dataType: 'decimal', formatString: '$#,##0.00' },
            { name: 'Quantity', dataType: 'int64', formatString: '#,##0' },
            { name: 'Discount', dataType: 'double', formatString: '0.0%' },
            { name: 'Profit', dataType: 'decimal', formatString: '$#,##0.00' },
            { name: 'Days_To_Ship', dataType: 'int64', formatString: '#,##0' }
          ],
          partitions: [
            {
              name: 'Fact_Sales-Partition',
              mode: 'import',
              source: {
                type: 'm',
                expression: [
                  'let',
                  '    Source = Csv.Document(File.Contents("Sales-Performance-Analytics/data/cleaned_sales_dataset.csv"),[Delimiter=",", Columns=21, Encoding=65001, QuoteStyle=QuoteStyle.Csv]),',
                  '    #"Promoted Headers" = Table.PromoteHeaders(Source, [PromoteAllScalars=true]),',
                  '    #"Changed Type" = Table.TransformColumnTypes(#"Promoted Headers",{{"Row_ID", Int64.Type}, {"Order_ID", type text}, {"Order_Date", type date}, {"Ship_Date", type date}, {"Ship_Mode", type text}, {"Customer_ID", type text}, {"Postal_Code", type text}, {"Product_ID", type text}, {"Sales", Currency.Type}, {"Quantity", Int64.Type}, {"Discount", type number}, {"Profit", Currency.Type}, {"Days_To_Ship", Int64.Type}})',
                  'in',
                  '    #"Changed Type"'
                ]
              }
            }
          ]
        },
        {
          name: 'Dim_Calendar',
          columns: [
            { name: 'Date', dataType: 'dateTime', isKey: true, formatString: 'yyyy-MM-dd' },
            { name: 'Year', dataType: 'int64' },
            { name: 'Month_Number', dataType: 'int64' },
            { name: 'Month_Name', dataType: 'string' },
            { name: 'Month_Year', dataType: 'string', sortByColumn: 'Year_Month_Key' },
            { name: 'Year_Month_Key', dataType: 'int64' },
            { name: 'Quarter', dataType: 'string' },
            { name: 'Quarter_Year', dataType: 'string' },
            { name: 'Is_Weekend', dataType: 'boolean' }
          ]
        },
        {
          name: 'Dim_Product',
          columns: [
            { name: 'Product_ID', dataType: 'string', isKey: true },
            { name: 'Product_Name', dataType: 'string' },
            { name: 'Category', dataType: 'string' },
            { name: 'Sub_Category', dataType: 'string' }
          ]
        },
        {
          name: 'Dim_Customer',
          columns: [
            { name: 'Customer_ID', dataType: 'string', isKey: true },
            { name: 'Customer_Name', dataType: 'string' },
            { name: 'Segment', dataType: 'string' }
          ]
        },
        {
          name: 'Dim_Geography',
          columns: [
            { name: 'Postal_Code', dataType: 'string', isKey: true },
            { name: 'City', dataType: 'string' },
            { name: 'State', dataType: 'string' },
            { name: 'Region', dataType: 'string' },
            { name: 'Country', dataType: 'string' }
          ]
        },
        {
          name: '_Measures',
          measures: [
            { name: 'Total Revenue', expression: 'SUM(Fact_Sales[Sales])', formatString: '$#,##0.00' },
            { name: 'Total Profit', expression: 'SUM(Fact_Sales[Profit])', formatString: '$#,##0.00' },
            { name: 'Profit Margin %', expression: 'DIVIDE([Total Profit], [Total Revenue], 0)', formatString: '0.0%' },
            { name: 'Total Orders', expression: 'DISTINCTCOUNT(Fact_Sales[Order_ID])', formatString: '#,##0' },
            { name: 'Total Quantity Sold', expression: 'SUM(Fact_Sales[Quantity])', formatString: '#,##0' },
            { name: 'Average Order Value', expression: 'DIVIDE([Total Revenue], [Total Orders], 0)', formatString: '$#,##0.00' },
            { name: 'Average Discount %', expression: 'AVERAGE(Fact_Sales[Discount])', formatString: '0.00%' },
            { name: 'Revenue PM', expression: 'CALCULATE([Total Revenue], DATEADD(Dim_Calendar[Date], -1, MONTH))', formatString: '$#,##0.00' },
            { name: 'Revenue MoM Growth %', expression: 'VAR Cur = [Total Revenue] VAR Prev = [Revenue PM] RETURN DIVIDE(Cur - Prev, Prev, BLANK())', formatString: '+0.0%;-0.0%;0.0%' }
          ]
        }
      ],
      relationships: [
        {
          name: 'rel_calendar_sales',
          fromTable: 'Fact_Sales',
          fromColumn: 'Order_Date',
          toTable: 'Dim_Calendar',
          toColumn: 'Date',
          crossFilteringBehavior: 'oneDirection'
        },
        {
          name: 'rel_product_sales',
          fromTable: 'Fact_Sales',
          fromColumn: 'Product_ID',
          toTable: 'Dim_Product',
          toColumn: 'Product_ID',
          crossFilteringBehavior: 'oneDirection'
        },
        {
          name: 'rel_customer_sales',
          fromTable: 'Fact_Sales',
          fromColumn: 'Customer_ID',
          toTable: 'Dim_Customer',
          toColumn: 'Customer_ID',
          crossFilteringBehavior: 'oneDirection'
        },
        {
          name: 'rel_geography_sales',
          fromTable: 'Fact_Sales',
          fromColumn: 'Postal_Code',
          toTable: 'Dim_Geography',
          toColumn: 'Postal_Code',
          crossFilteringBehavior: 'oneDirection'
        }
      ]
    }
  };

  // Note: DataModelSchema is UTF-16LE without BOM
  const dmsBuffer = Buffer.from(JSON.stringify(dataModelSchema, null, 2), 'utf16le');
  zip.file('DataModelSchema', dmsBuffer);

  // 6. Report/Layout (JSON canvas layout with pages & visual controls)
  const reportLayout = {
    id: 0,
    resourcePackages: [],
    sections: [
      {
        id: 0,
        name: 'ReportSection_ExecutiveOverview',
        displayName: 'Executive Overview',
        width: 1280,
        height: 720,
        visualContainers: [
          {
            x: 20, y: 15, width: 1240, height: 60,
            config: JSON.stringify({
              name: 'TitleHeader',
              singleVisual: {
                visualType: 'textbox',
                objects: {
                  general: [{ properties: { paragraphs: [{ textRuns: [{ value: 'Sales Performance Analytics Dashboard' }] }] } }]
                }
              }
            })
          },
          {
            x: 20, y: 85, width: 195, height: 95,
            config: JSON.stringify({
              name: 'CardTotalRevenue',
              singleVisual: { visualType: 'card', projections: { Values: [{ queryRef: '_Measures.Total Revenue' }] } }
            })
          },
          {
            x: 225, y: 85, width: 195, height: 95,
            config: JSON.stringify({
              name: 'CardTotalProfit',
              singleVisual: { visualType: 'card', projections: { Values: [{ queryRef: '_Measures.Total Profit' }] } }
            })
          },
          {
            x: 430, y: 85, width: 195, height: 95,
            config: JSON.stringify({
              name: 'CardProfitMargin',
              singleVisual: { visualType: 'card', projections: { Values: [{ queryRef: '_Measures.Profit Margin %' }] } }
            })
          },
          {
            x: 635, y: 85, width: 195, height: 95,
            config: JSON.stringify({
              name: 'CardTotalOrders',
              singleVisual: { visualType: 'card', projections: { Values: [{ queryRef: '_Measures.Total Orders' }] } }
            })
          },
          {
            x: 840, y: 85, width: 195, height: 95,
            config: JSON.stringify({
              name: 'CardUnitsSold',
              singleVisual: { visualType: 'card', projections: { Values: [{ queryRef: '_Measures.Total Quantity Sold' }] } }
            })
          },
          {
            x: 1045, y: 85, width: 215, height: 95,
            config: JSON.stringify({
              name: 'CardAOV',
              singleVisual: { visualType: 'card', projections: { Values: [{ queryRef: '_Measures.Average Order Value' }] } }
            })
          },
          {
            x: 20, y: 190, width: 780, height: 320,
            config: JSON.stringify({
              name: 'MonthlyTrendAreaChart',
              singleVisual: {
                visualType: 'areaChart',
                projections: {
                  Category: [{ queryRef: 'Dim_Calendar.Month_Year' }],
                  Y: [{ queryRef: '_Measures.Total Revenue' }],
                  SecondaryY: [{ queryRef: '_Measures.Total Profit' }]
                }
              }
            })
          },
          {
            x: 810, y: 190, width: 450, height: 320,
            config: JSON.stringify({
              name: 'RegionalBreakdownChart',
              singleVisual: {
                visualType: 'barChart',
                projections: {
                  Category: [{ queryRef: 'Dim_Geography.Region' }],
                  Y: [{ queryRef: '_Measures.Total Revenue' }]
                }
              }
            })
          },
          {
            x: 20, y: 520, width: 1240, height: 180,
            config: JSON.stringify({
              name: 'SubCategoryProfitabilityMatrix',
              singleVisual: {
                visualType: 'clusteredBarChart',
                projections: {
                  Category: [{ queryRef: 'Dim_Product.Sub_Category' }],
                  Y: [{ queryRef: '_Measures.Total Profit' }]
                }
              }
            })
          }
        ]
      }
    ]
  };

  // Report/Layout is UTF-16LE without BOM
  const layoutBuffer = Buffer.from(JSON.stringify(reportLayout, null, 2), 'utf16le');
  zip.folder('Report')!.file('Layout', layoutBuffer);

  // 7. DiagramLayout
  const diagramLayout = {
    version: '1.0.0',
    diagrams: [
      {
        ordinal: 0,
        scrollPosition: { x: 0, y: 0 },
        zoomLevel: 100,
        nodes: [
          { location: { x: 450, y: 200 }, nodeIndex: 'Fact_Sales', size: { width: 200, height: 300 } },
          { location: { x: 450, y: 20 }, nodeIndex: 'Dim_Calendar', size: { width: 180, height: 150 } },
          { location: { x: 150, y: 200 }, nodeIndex: 'Dim_Customer', size: { width: 180, height: 150 } },
          { location: { x: 750, y: 200 }, nodeIndex: 'Dim_Product', size: { width: 180, height: 150 } },
          { location: { x: 450, y: 550 }, nodeIndex: 'Dim_Geography', size: { width: 180, height: 150 } }
        ]
      }
    ]
  };
  zip.file('DiagramLayout', JSON.stringify(diagramLayout, null, 2));

  // Generate binary buffers
  const pbixBuffer = await zip.generateAsync({
    type: 'nodebuffer',
    compression: 'DEFLATE',
    compressionOptions: { level: 6 }
  });

  const dashboardDir = path.resolve(process.cwd(), 'Sales-Performance-Analytics', 'dashboard');
  if (!fs.existsSync(dashboardDir)) fs.mkdirSync(dashboardDir, { recursive: true });

  // 1. Output .pbix file
  const pbixPath = path.join(dashboardDir, 'Sales_Performance_Analytics.pbix');
  fs.writeFileSync(pbixPath, pbixBuffer);

  // 2. Output .pbit (Power BI Template) file
  const pbitPath = path.join(dashboardDir, 'Sales_Performance_Analytics.pbit');
  fs.writeFileSync(pbitPath, pbixBuffer);

  console.log(`Generated: ${pbixPath} (${pbixBuffer.length} bytes)`);
  console.log(`Generated: ${pbitPath} (${pbixBuffer.length} bytes)`);
}

generatePowerBiFiles().catch(console.error);
