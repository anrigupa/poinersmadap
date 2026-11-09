/**
 * Letter Template Engine & Type Contracts
 * Location: public/templates/*.json
 */

export interface LetterTemplateHeader {
  governmentAgency: string;
  educationDepartment: string;
  institutionName: string;
  addressLine: string;
  contactLine: string;
  leftEmblemPlaceholder?: string;
  rightEmblemPlaceholder?: string;
}

export interface LetterTemplateMetadata {
  referenceNumber: string;
  attachment: string;
  subject: string;
  dateLocation: string;
}

export interface LetterTemplateRecipient {
  salutation?: string;
  addressee: string;
  location?: string;
}

export interface LetterTemplateFieldItem {
  label: string;
  value: string;
}

export interface LetterTemplateSignatures {
  left: {
    role: string;
    placeholderName?: string;
    caption?: string;
  };
  right: {
    role: string;
    name: string;
    identifier: string;
  };
}

export interface LetterTemplateSchema {
  id: string;
  title: string;
  category: "counseling" | "administrative" | "discipline";
  version: string;
  header: LetterTemplateHeader;
  metadata: LetterTemplateMetadata;
  recipient: LetterTemplateRecipient;
  opening: string[];
  studentInfoSections: LetterTemplateFieldItem[];
  invitationIntro?: string;
  meetingSchedule: LetterTemplateFieldItem[];
  notesIntro?: string;
  notes?: string;
  closing: string[];
  signatures: LetterTemplateSignatures;
}

export interface LetterTemplateVariableContext {
  [key: string]: string | number | undefined;
}

/**
 * Replaces mustache-style placeholders `{{variable_name}}` in string content.
 */
export function interpolateTemplateString(
  template: string,
  variables: LetterTemplateVariableContext
): string {
  if (!template) return "";
  return template.replace(/\{\{\s*([a-zA-Z0-9_]+)\s*\}\}/g, (_, key) => {
    const val = variables[key];
    return val !== undefined && val !== null ? String(val) : "";
  });
}

/**
 * Hydrates an entire LetterTemplateSchema with the provided variable context.
 */
export function hydrateLetterTemplate(
  template: LetterTemplateSchema,
  variables: LetterTemplateVariableContext
): LetterTemplateSchema {
  return {
    ...template,
    header: {
      governmentAgency: interpolateTemplateString(template.header.governmentAgency, variables),
      educationDepartment: interpolateTemplateString(template.header.educationDepartment, variables),
      institutionName: interpolateTemplateString(template.header.institutionName, variables),
      addressLine: interpolateTemplateString(template.header.addressLine, variables),
      contactLine: interpolateTemplateString(template.header.contactLine, variables),
      leftEmblemPlaceholder: template.header.leftEmblemPlaceholder,
      rightEmblemPlaceholder: template.header.rightEmblemPlaceholder,
    },
    metadata: {
      referenceNumber: interpolateTemplateString(template.metadata.referenceNumber, variables),
      attachment: interpolateTemplateString(template.metadata.attachment, variables),
      subject: interpolateTemplateString(template.metadata.subject, variables),
      dateLocation: interpolateTemplateString(template.metadata.dateLocation, variables),
    },
    recipient: {
      salutation: template.recipient.salutation
        ? interpolateTemplateString(template.recipient.salutation, variables)
        : undefined,
      addressee: interpolateTemplateString(template.recipient.addressee, variables),
      location: template.recipient.location
        ? interpolateTemplateString(template.recipient.location, variables)
        : undefined,
    },
    opening: template.opening.map((line) => interpolateTemplateString(line, variables)),
    studentInfoSections: template.studentInfoSections.map((item) => ({
      label: interpolateTemplateString(item.label, variables),
      value: interpolateTemplateString(item.value, variables),
    })),
    invitationIntro: template.invitationIntro
      ? interpolateTemplateString(template.invitationIntro, variables)
      : undefined,
    meetingSchedule: template.meetingSchedule.map((item) => ({
      label: interpolateTemplateString(item.label, variables),
      value: interpolateTemplateString(item.value, variables),
    })),
    notesIntro: template.notesIntro
      ? interpolateTemplateString(template.notesIntro, variables)
      : undefined,
    notes: template.notes ? interpolateTemplateString(template.notes, variables) : undefined,
    closing: template.closing.map((line) => interpolateTemplateString(line, variables)),
    signatures: {
      left: {
        role: interpolateTemplateString(template.signatures.left.role, variables),
        placeholderName: template.signatures.left.placeholderName,
        caption: template.signatures.left.caption,
      },
      right: {
        role: interpolateTemplateString(template.signatures.right.role, variables),
        name: interpolateTemplateString(template.signatures.right.name, variables),
        identifier: interpolateTemplateString(template.signatures.right.identifier, variables),
      },
    },
  };
}

/**
 * Default fallback placeholder template if network/file fetch fails
 */
export const DEFAULT_PLACEHOLDER_LETTER_TEMPLATE: LetterTemplateSchema = {
  id: "surat-panggilan-orang-tua",
  title: "Surat Panggilan Orang Tua / Wali",
  category: "counseling",
  version: "1.0.0",
  header: {
    governmentAgency: "{{header_gov_agency}}",
    educationDepartment: "{{header_edu_dept}}",
    institutionName: "{{header_institution_name}}",
    addressLine: "{{header_address}}",
    contactLine: "{{header_contact}}",
    leftEmblemPlaceholder: "SMADAP",
    rightEmblemPlaceholder: "PANGKEP",
  },
  metadata: {
    referenceNumber: "{{letter_number}}",
    attachment: "-",
    subject: "{{letter_subject}}",
    dateLocation: "{{date_location}}",
  },
  recipient: {
    salutation: "Kepada Yth.",
    addressee: "Bapak / Ibu Orang Tua / Wali dari {{student_name}}",
    location: "di Tempat",
  },
  opening: [
    "Dengan hormat,",
    "Sehubungan dengan hasil evaluasi perkembangan perilaku, kedisiplinan, dan pelaksanaan tata tertib sekolah, dengan ini kami sampaikan catatan rekam disiplin peserta didik sebagai berikut:",
  ],
  studentInfoSections: [
    { label: "Nama Siswa", value: "{{student_name}}" },
    { label: "NISN / NIS", value: "{{student_nisn}} / {{student_nis}}" },
    { label: "Kelas", value: "{{student_class}}" },
    { label: "Total Pelanggaran", value: "{{total_violations}} kasus tercatat" },
    { label: "Total Poin Pelanggaran", value: "{{total_violation_points}} Poin" },
    { label: "Total Pemutihan Poin", value: "-{{total_reduction_points}} Poin" },
    { label: "Poin Efektif Aktif", value: "{{effective_points}} Poin (Status: {{discipline_status}})" },
  ],
  invitationIntro:
    "Guna mewujudkan koordinasi yang harmonis antara pihak sekolah dan orang tua/wali demi pembinaan peserta didik yang bersangkutan, kami mengharapkan kehadiran Bapak/Ibu pada:",
  meetingSchedule: [
    { label: "Hari / Tanggal", value: "{{scheduled_date_formatted}}" },
    { label: "Waktu Pertemuan", value: "{{scheduled_time}} WITA" },
    { label: "Tempat Pertemuan", value: "{{meeting_location}}" },
    { label: "Keperluan / Agenda", value: "{{call_purpose}}" },
  ],
  notesIntro: "Catatan Khusus:",
  notes: "{{additional_notes}}",
  closing: [
    "Mengingat pentingnya agenda ini demi masa depan pendidikan dan pembentukan karakter peserta didik, kami sangat mengharapkan kehadiran Bapak/Ibu tepat pada waktu yang telah ditentukan.",
    "Demikian surat panggilan ini kami sampaikan. Atas perhatian, pengertian, dan kerja sama yang baik, kami ucapkan terima kasih.",
  ],
  signatures: {
    left: {
      role: "Orang Tua / Wali Peserta Didik,",
      placeholderName: "( .................................................... )",
      caption: "Tanda Tangan & Nama Terang",
    },
    right: {
      role: "Guru Bimbingan Konseling (BK),",
      name: "{{counselor_name}}",
      identifier: "NIP. {{counselor_nip}}",
    },
  },
};

/**
 * Asynchronously load an external template from /templates/<templateId>.json
 */
export async function loadLetterTemplate(templateId: string): Promise<LetterTemplateSchema> {
  try {
    const res = await fetch(`/templates/${templateId}.json`, {
      headers: { Accept: "application/json" },
      cache: "no-store",
    });
    if (!res.ok) {
      console.warn(`Could not load template from /templates/${templateId}.json, using default`);
      return DEFAULT_PLACEHOLDER_LETTER_TEMPLATE;
    }
    const data = (await res.json()) as LetterTemplateSchema;
    return data;
  } catch (err) {
    console.warn(`Error loading /templates/${templateId}.json:`, err);
    return DEFAULT_PLACEHOLDER_LETTER_TEMPLATE;
  }
}
