import { SchemaObject } from '@nestjs/swagger';

export const UpdatePatientSwaggerSchema: SchemaObject = {
  type: 'object',
  properties: {
    profilePicture: {
      type: 'string',
      format: 'binary',
      description: 'Profile image file (e.g., jpg, png)',
    },
    firstName: {
      type: 'string',
      example: 'John',
      description: 'First name of the person',
    },
    middleName: {
      type: 'string',
      example: 'Charles',
      description: 'Middle name of the person',
    },
    lastName: {
      type: 'string',
      example: 'Doe',
      description: 'Last name of the person',
    },
    birthDate: {
      type: 'string',
      format: 'date',
      example: '1990-05-15',
      description: 'Date of birth (YYYY-MM-DD)',
    },
    gender: {
      type: 'string',
      enum: ['male', 'female', 'other'],
      example: 'male',
      description: 'Biological gender or gender identity',
    },
    phone: {
      type: 'string',
      example: '71234567',
      description: 'Primary contact phone number',
    },
    address: {
      type: 'string',
      example: '742 Evergreen Terrace',
      description: 'Residential address',
    },
    occupation: {
      type: 'string',
      example: 'Software Engineer',
      description: 'Patient occupation',
    },
    userId: {
      type: 'integer',
      example: 42,
      description: 'Associated user account ID if applicable',
    },
    completeOdontogram: {
      type: 'boolean',
      example: false,
      description:
        'Indicates whether the initial odontogram evaluation is complete',
    },
    medicalHistory: {
      type: 'string',
      example: 'Hypertension diagnosed in 2021',
      description: 'Relevant past medical conditions',
    },
    allergicReactions: {
      type: 'string',
      example: 'Penicillin, latex',
      description: 'Documented allergies or adverse drug reactions',
    },
    currentSystemicTreatment: {
      type: 'string',
      example: 'Lisinopril 10mg daily',
      description: 'Active medications or systemic therapies',
    },
    labResults: {
      type: 'string',
      example: 'Normal fasting glucose (85 mg/dL)',
      description: 'Summary or reference of recent laboratory studies',
    },
    systemEvaluationNotes: {
      type: 'string',
      example: 'No relevant findings on cranial nerves examination',
      description: 'Clinical findings or observations from system review',
    },
    hasSncIssues: {
      type: 'boolean',
      example: false,
      description: 'Central Nervous System (SNC) pathologies',
    },
    hasSvcIssues: {
      type: 'boolean',
      example: false,
      description: 'Cardiovascular System (SVC) pathologies',
    },
    hasSeIssues: {
      type: 'boolean',
      example: false,
      description: 'Endocrine System (SE) pathologies',
    },
    hasSmeIssues: {
      type: 'boolean',
      example: false,
      description: 'Musculoskeletal System (SME) pathologies',
    },
    hasSrIssues: {
      type: 'boolean',
      example: false,
      description: 'Respiratory System (SR) pathologies',
    },
    hasSuIssues: {
      type: 'boolean',
      example: false,
      description: 'Urinary System (SU) pathologies',
    },
    hasSguIssues: {
      type: 'boolean',
      example: false,
      description: 'Genitourinary System (SGU) pathologies',
    },
    hasSgiIssues: {
      type: 'boolean',
      example: false,
      description: 'Gastrointestinal System (SGI) pathologies',
    },
  },
};
