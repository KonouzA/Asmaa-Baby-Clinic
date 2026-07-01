import { Hono } from 'hono';
import { HTTPException } from 'hono/http-exception';
import { zValidator } from '@hono/zod-validator';
import {
  patientListQuerySchema,
  createPatientSchema,
  updatePatientSchema,
  allergySchema,
  updateAllergySchema,
  problemSchema,
  updateProblemSchema,
  patientMedicationSchema,
  updatePatientMedicationSchema,
  immunizationSchema,
} from './patients.schema';
import {
  listPatients,
  getPatient,
  getPatientFull,
  createPatient,
  updatePatient,
  deletePatient,
  listAllergies,
  createAllergy,
  updateAllergy,
  deleteAllergy,
  listProblems,
  createProblem,
  updateProblem,
  deleteProblem,
  listMedications,
  createMedication,
  updateMedication,
  deleteMedication,
  listImmunizations,
  createImmunization,
  deleteImmunization,
  getPatientGrowth,
  getPatientVisits,
} from './patients.service';

function requirePatient(id: string) {
  const patient = getPatient(id);
  if (!patient) throw new HTTPException(404, { message: 'Patient not found' });
  return patient;
}

export const patientsRoutes = new Hono()

  // ── Core CRUD ────────────────────────────────────────────────────────────────

  .get('/', zValidator('query', patientListQuerySchema), (c) => {
    return c.json(listPatients(c.req.valid('query')));
  })

  .post('/', zValidator('json', createPatientSchema), (c) => {
    return c.json(createPatient(c.req.valid('json')), 201);
  })

  .get('/:id', (c) => {
    const patient = getPatient(c.req.param('id'));
    if (!patient) throw new HTTPException(404, { message: 'Patient not found' });
    return c.json(patient);
  })

  .get('/:id/full', (c) => {
    const full = getPatientFull(c.req.param('id'));
    if (!full) throw new HTTPException(404, { message: 'Patient not found' });
    return c.json(full);
  })

  .put('/:id', zValidator('json', updatePatientSchema), (c) => {
    requirePatient(c.req.param('id'));
    const updated = updatePatient(c.req.param('id'), c.req.valid('json'));
    return c.json(updated);
  })

  .delete('/:id', (c) => {
    requirePatient(c.req.param('id'));
    deletePatient(c.req.param('id'));
    return c.json({ ok: true });
  })

  // ── Allergies ────────────────────────────────────────────────────────────────

  .get('/:id/allergies', (c) => {
    requirePatient(c.req.param('id'));
    return c.json(listAllergies(c.req.param('id')));
  })

  .post('/:id/allergies', zValidator('json', allergySchema), (c) => {
    requirePatient(c.req.param('id'));
    return c.json(createAllergy(c.req.param('id'), c.req.valid('json')), 201);
  })

  .put('/:id/allergies/:allergyId', zValidator('json', updateAllergySchema), (c) => {
    const updated = updateAllergy(c.req.param('allergyId'), c.req.param('id'), c.req.valid('json'));
    if (!updated) throw new HTTPException(404, { message: 'Allergy not found' });
    return c.json(updated);
  })

  .delete('/:id/allergies/:allergyId', (c) => {
    deleteAllergy(c.req.param('allergyId'), c.req.param('id'));
    return c.json({ ok: true });
  })

  // ── Problems ─────────────────────────────────────────────────────────────────

  .get('/:id/problems', (c) => {
    requirePatient(c.req.param('id'));
    return c.json(listProblems(c.req.param('id')));
  })

  .post('/:id/problems', zValidator('json', problemSchema), (c) => {
    requirePatient(c.req.param('id'));
    return c.json(createProblem(c.req.param('id'), c.req.valid('json')), 201);
  })

  .put('/:id/problems/:problemId', zValidator('json', updateProblemSchema), (c) => {
    const updated = updateProblem(c.req.param('problemId'), c.req.param('id'), c.req.valid('json'));
    if (!updated) throw new HTTPException(404, { message: 'Problem not found' });
    return c.json(updated);
  })

  .delete('/:id/problems/:problemId', (c) => {
    deleteProblem(c.req.param('problemId'), c.req.param('id'));
    return c.json({ ok: true });
  })

  // ── Medications ───────────────────────────────────────────────────────────────

  .get('/:id/medications', (c) => {
    requirePatient(c.req.param('id'));
    return c.json(listMedications(c.req.param('id')));
  })

  .post('/:id/medications', zValidator('json', patientMedicationSchema), (c) => {
    requirePatient(c.req.param('id'));
    return c.json(createMedication(c.req.param('id'), c.req.valid('json')), 201);
  })

  .put('/:id/medications/:medId', zValidator('json', updatePatientMedicationSchema), (c) => {
    const updated = updateMedication(c.req.param('medId'), c.req.param('id'), c.req.valid('json'));
    if (!updated) throw new HTTPException(404, { message: 'Medication not found' });
    return c.json(updated);
  })

  .delete('/:id/medications/:medId', (c) => {
    deleteMedication(c.req.param('medId'), c.req.param('id'));
    return c.json({ ok: true });
  })

  // ── Immunizations ─────────────────────────────────────────────────────────────

  .get('/:id/immunizations', (c) => {
    requirePatient(c.req.param('id'));
    return c.json(listImmunizations(c.req.param('id')));
  })

  .post('/:id/immunizations', zValidator('json', immunizationSchema), (c) => {
    requirePatient(c.req.param('id'));
    return c.json(createImmunization(c.req.param('id'), c.req.valid('json')), 201);
  })

  .delete('/:id/immunizations/:immId', (c) => {
    deleteImmunization(c.req.param('immId'), c.req.param('id'));
    return c.json({ ok: true });
  })

  // ── Derived ───────────────────────────────────────────────────────────────────

  .get('/:id/growth', (c) => {
    requirePatient(c.req.param('id'));
    return c.json(getPatientGrowth(c.req.param('id')));
  })

  .get('/:id/visits', (c) => {
    requirePatient(c.req.param('id'));
    return c.json(getPatientVisits(c.req.param('id')));
  });
