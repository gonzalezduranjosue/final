import { Document, Packer, Paragraph, TextRun, Table, TableRow, TableCell, WidthType, HeadingLevel, AlignmentType, ShadingType, BorderStyle } from 'docx';
import FileSaver from 'file-saver';
import { ProjectInfo, MaterialItem, LaborItem, DietInfo, WorkerInfo, Language } from '../types';

const TRANSLATIONS = {
  es: {
    title: "RESUMEN DE PRESUPUESTO",
    beneficiary: "Beneficiario:",
    mainWorker: "Albañil Principal:",
    otherWorkers: "Otros Trabajadores:",
    materials: "MATERIALES UTILIZADOS",
    labor: "TRABAJOS REALIZADOS",
    diets: "DIETAS",
    materialsTotal: "TOTAL MATERIALES:",
    laborTotal: "TOTAL MANO DE OBRA:",
    dietsTotal: "TOTAL DIETAS:",
    finalTotal: "PRESUPUESTO TOTAL:",
    approvedBy: "Aprobado por:",
    date: "Fecha:",
    description: "Descripción",
    quantity: "Cant.",
    unit: "Unidad",
    unitPrice: "P. Unit.",
    total: "Total",
    workDescription: "Descripción del Trabajo",
    cost: "Costo",
    workers: "trabajadores",
    days: "días",
    perMeal: "c/u",
    currency: "MN",
    signature: "Firma",
  },
  en: {
    title: "BUDGET SUMMARY",
    beneficiary: "Beneficiary:",
    mainWorker: "Main Worker:",
    otherWorkers: "Other Workers:",
    materials: "MATERIALS USED",
    labor: "WORK PERFORMED",
    diets: "MEALS / DIETS",
    materialsTotal: "TOTAL MATERIALS:",
    laborTotal: "TOTAL LABOR:",
    dietsTotal: "TOTAL MEALS:",
    finalTotal: "TOTAL BUDGET:",
    approvedBy: "Approved by:",
    date: "Date:",
    description: "Description",
    quantity: "Qty",
    unit: "Unit",
    unitPrice: "U. Price",
    total: "Total",
    workDescription: "Work Description",
    cost: "Cost",
    workers: "workers",
    days: "days",
    perMeal: "ea",
    currency: "MN",
    signature: "Signature",
  }
};

const CELL_SHADING = {
  fill: "3498db",
  type: ShadingType.SOLID,
  color: "FFFFFF"
};

const HEADER_TEXT_COLOR = "FFFFFF";
const BORDER_STYLE = { style: BorderStyle.SINGLE, size: 1, color: "CCCCCC" };

export const generateDocument = async (
  project: ProjectInfo,
  workers: WorkerInfo[],
  materials: MaterialItem[],
  labor: LaborItem[],
  diet: DietInfo,
  lang: Language
) => {
  const t = TRANSLATIONS[lang];
  
  // Calculations
  const materialTotal = materials.reduce((sum, item) => sum + (item.quantity * item.unitPrice), 0);
  const laborTotal = labor.reduce((sum, item) => sum + item.cost, 0);
  const dietTotal = diet.workersCount * diet.days * diet.costPerDay;
  const grandTotal = materialTotal + laborTotal + dietTotal;

  // Helper to create header cells
  const createHeaderCell = (text: string, width: number) => {
    return new TableCell({
      width: { size: width, type: WidthType.PERCENTAGE },
      shading: CELL_SHADING,
      children: [
        new Paragraph({
            children: [new TextRun({ text, bold: true, color: HEADER_TEXT_COLOR })],
            alignment: AlignmentType.CENTER
        })
      ],
      borders: {
          top: BORDER_STYLE, bottom: BORDER_STYLE, left: BORDER_STYLE, right: BORDER_STYLE
      }
    });
  };

  // Helper for regular cells
  const createCell = (text: string | number, align = AlignmentType.LEFT) => {
    return new TableCell({
      children: [new Paragraph({ text: String(text), alignment: align })],
      borders: {
          top: BORDER_STYLE, bottom: BORDER_STYLE, left: BORDER_STYLE, right: BORDER_STYLE
      },
      verticalAlign: "center",
      margins: { top: 100, bottom: 100, left: 100, right: 100 }
    });
  };

  const sections = [];

  // --- HEADER SECTION ---
  sections.push(
    new Paragraph({
      text: t.title,
      heading: HeadingLevel.TITLE,
      alignment: AlignmentType.CENTER,
      spacing: { after: 200 }
    }),
    new Paragraph({
        children: [
            new TextRun({ text: project.projectName, bold: true, size: 28 }),
        ],
        alignment: AlignmentType.CENTER,
        spacing: { after: 400 }
    }),
    new Paragraph({
      children: [
        new TextRun({ text: `${t.beneficiary} `, bold: true }),
        new TextRun({ text: project.beneficiary || "---" })
      ],
      spacing: { after: 100 }
    })
  );

  // Workers
  const mainWorker = workers.find(w => w.role === 'Principal');
  const otherWorkers = workers.filter(w => w.role !== 'Principal').map(w => w.name).join(', ');

  sections.push(
    new Paragraph({
      children: [
        new TextRun({ text: `${t.mainWorker} `, bold: true }),
        new TextRun({ text: mainWorker?.name || "---" })
      ],
      spacing: { after: 100 }
    })
  );

  if (otherWorkers) {
      sections.push(
        new Paragraph({
            children: [
              new TextRun({ text: `${t.otherWorkers} `, bold: true }),
              new TextRun({ text: otherWorkers })
            ],
            spacing: { after: 400 }
          })
      );
  }

  // --- MATERIALS SECTION ---
  if (materials.length > 0) {
    sections.push(
        new Paragraph({
            text: t.materials,
            heading: HeadingLevel.HEADING_2,
            spacing: { before: 200, after: 200 }
        })
    );

    const matRows = materials.map(m => new TableRow({
        children: [
            createCell(m.description),
            createCell(m.quantity, AlignmentType.CENTER),
            createCell(m.unit, AlignmentType.CENTER),
            createCell(`$${m.unitPrice.toFixed(2)}`, AlignmentType.RIGHT),
            createCell(`$${(m.quantity * m.unitPrice).toFixed(2)}`, AlignmentType.RIGHT),
        ]
    }));

    const matTable = new Table({
        width: { size: 100, type: WidthType.PERCENTAGE },
        rows: [
            new TableRow({
                children: [
                    createHeaderCell(t.description, 40),
                    createHeaderCell(t.quantity, 10),
                    createHeaderCell(t.unit, 15),
                    createHeaderCell(t.unitPrice, 15),
                    createHeaderCell(t.total, 20),
                ]
            }),
            ...matRows
        ]
    });
    sections.push(matTable);

    sections.push(
        new Paragraph({
            children: [
                new TextRun({ text: t.materialsTotal + " ", bold: true }),
                new TextRun({ text: `$${materialTotal.toFixed(2)} ${t.currency}` })
            ],
            alignment: AlignmentType.RIGHT,
            spacing: { before: 200 }
        })
    );
  }

  // --- LABOR SECTION ---
  if (labor.length > 0) {
    sections.push(
        new Paragraph({
            text: t.labor,
            heading: HeadingLevel.HEADING_2,
            spacing: { before: 400, after: 200 }
        })
    );

    const laborRows = labor.map(l => new TableRow({
        children: [
            createCell(l.description),
            createCell(`$${l.cost.toFixed(2)}`, AlignmentType.RIGHT),
        ]
    }));

    const laborTable = new Table({
        width: { size: 100, type: WidthType.PERCENTAGE },
        rows: [
            new TableRow({
                children: [
                    createHeaderCell(t.workDescription, 75),
                    createHeaderCell(t.cost, 25),
                ]
            }),
            ...laborRows
        ]
    });
    sections.push(laborTable);

    sections.push(
        new Paragraph({
            children: [
                new TextRun({ text: t.laborTotal + " ", bold: true }),
                new TextRun({ text: `$${laborTotal.toFixed(2)} ${t.currency}` })
            ],
            alignment: AlignmentType.RIGHT,
            spacing: { before: 200 }
        })
    );
  }

  // --- DIETS SECTION ---
  if (diet.workersCount > 0 && diet.days > 0) {
    sections.push(
        new Paragraph({
            text: t.diets,
            heading: HeadingLevel.HEADING_2,
            spacing: { before: 400, after: 200 }
        }),
        new Paragraph({
            text: `${diet.workersCount} ${t.workers} x ${diet.days} ${t.days} @ $${diet.costPerDay.toFixed(2)} ${t.perMeal}`,
            alignment: AlignmentType.RIGHT
        }),
        new Paragraph({
            children: [
                new TextRun({ text: t.dietsTotal + " ", bold: true }),
                new TextRun({ text: `$${dietTotal.toFixed(2)} ${t.currency}` })
            ],
            alignment: AlignmentType.RIGHT,
            spacing: { before: 100 }
        })
    );
  }

  // --- TOTAL & SIGNATURES ---
  sections.push(
      new Paragraph({
          children: [
              new TextRun({ text: "____________________________________________________________", color: "CCCCCC" })
          ],
          alignment: AlignmentType.CENTER,
          spacing: { before: 400, after: 200 }
      }),
      new Paragraph({
          children: [
              new TextRun({ text: t.finalTotal + " ", bold: true, size: 28 }),
              new TextRun({ text: `$${grandTotal.toFixed(2)} ${t.currency}`, bold: true, size: 28, color: "2c3e50" })
          ],
          alignment: AlignmentType.CENTER,
          spacing: { after: 600 }
      })
  );

  // Observations
  if (project.observations) {
      sections.push(
          new Paragraph({ text: "Observaciones / Observations:", bold: true }),
          new Paragraph({ text: project.observations, spacing: { after: 400 } })
      );
  }

  // Signatures Table
  const sigTable = new Table({
      width: { size: 100, type: WidthType.PERCENTAGE },
      borders: {
          top: { style: BorderStyle.NONE },
          bottom: { style: BorderStyle.NONE },
          left: { style: BorderStyle.NONE },
          right: { style: BorderStyle.NONE },
          insideVertical: { style: BorderStyle.NONE },
          insideHorizontal: { style: BorderStyle.NONE },
      },
      rows: [
          new TableRow({
              children: [
                  new TableCell({
                      children: [
                          new Paragraph({
                              children: [
                                  new TextRun({ text: `${t.approvedBy} ${project.approverName}`, bold: true }),
                              ],
                          }),
                          new Paragraph({ text: "\n\n__________________________" }),
                          new Paragraph({ text: t.signature })
                      ],
                      width: { size: 50, type: WidthType.PERCENTAGE }
                  }),
                  new TableCell({
                      children: [
                          new Paragraph({
                            children: [
                                new TextRun({ text: `${t.date} ${project.approvalDate}`, bold: true }),
                            ],
                            alignment: AlignmentType.RIGHT
                          })
                      ],
                      width: { size: 50, type: WidthType.PERCENTAGE }
                  })
              ]
          })
      ]
  });
  sections.push(sigTable);

  const doc = new Document({
      sections: [{
          properties: {
            page: {
                margin: { top: 720, right: 720, bottom: 720, left: 720 }, // ~0.5 inch margins
            },
          },
          children: sections
      }]
  });

  const blob = await Packer.toBlob(doc);
  const fileName = `${project.projectName.replace(/\s+/g, '_') || 'presupuesto'}_${lang}.docx`;
  FileSaver.saveAs(blob, fileName);
};