import { ReferenceObject, SchemaObject } from '@nestjs/swagger';

const doctorProperties: Record<string, SchemaObject | ReferenceObject> = {
  profilePicture: {
    type: 'string',
    format: 'binary',
    description: 'Profile image file (jpg, jpeg, png, webp). Max 5 MB',
  },
  firstName: {
    type: 'string',
    example: 'Juan',
    description: "First name of the doctor's person record",
  },
  middleName: {
    type: 'string',
    example: 'Carlos',
    description: "Middle name of the doctor's person record",
  },
  lastName: {
    type: 'string',
    example: 'Pérez',
    description: "Last name of the doctor's person record",
  },
  userId: {
    type: 'integer',
    example: 1,
    description: 'Application user account linked to this person, if any',
  },
  phone: {
    type: 'string',
    example: '71234567',
    description: 'Contact phone number, exactly 8 digits',
  },
  qualification: {
    type: 'string',
    example: 'Doctor en Odontología, MSc en Implantología',
    maxLength: 255,
    description: 'Academic degree or professional title of the doctor',
  },
  specialties: {
    type: 'string',
    example: '[{"specialtyId":3,"isPrimary":true}]',
    description:
      'Specialties to attach in the same transaction, as a JSON string because multipart/form-data cannot carry a nested array. Send "[]" or omit it for none. Max 20',
  },
};

export const CreateDoctorSwaggerSchema: SchemaObject = {
  type: 'object',
  required: ['firstName', 'lastName'],
  properties: doctorProperties,
};

export const UpdateDoctorSwaggerSchema: SchemaObject = {
  type: 'object',
  properties: doctorProperties,
};
