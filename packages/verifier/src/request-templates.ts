import { ProofRequestTemplate, ProofRequestType } from './types/proof-reqeust-template'

export const useProofRequestTemplates = (useDevRestrictions: boolean) => {
  const studentRestrictions = [{ cred_def_id: 'RtNBE1EPFr6N4wpiuGKN2z:3:CL:346020:issuer-kit-demo' }]
  const studentDevRestrictions = [{ schema_name: 'vehicle_credential' }]
  const restrictions = useDevRestrictions ? studentDevRestrictions : studentRestrictions
  const defaultProofRequestTemplates: Array<ProofRequestTemplate> = [
    {
      id: 'Aries:5:VerifiedFullName:0.0.1:indy',
      name: 'Full Name',
      description: 'Verify the details of a verified car',
      version: '0.0.1',
      payload: {
        type: ProofRequestType.AnonCreds,
        data: [
          {
            schema: 'RtNBE1EPFr6N4wpiuGKN2z:2:vehicle_credential:0.1.0',
            requestedAttributes: [
              {
                name: 'vehicle_name',
                restrictions,
              },
              {
                name: 'vehicle_owner',
                restrictions,
              },
            ],
          },
        ],
      },
    },
    {
      id: 'Aries:5:StudentFullNameAndExpirationDate:0.0.1:indy',
      name: 'Student full name and expiration date',
      description: 'Verify that full name of a student and that he/she has a not expired student card.',
      version: '0.0.1',
      payload: {
        type: ProofRequestType.AnonCreds,
        data: [
          {
            schema: 'XUxBrVSALWHLeycAUhrNr9:3:CL:26293:Student Card',
            requestedAttributes: [
              {
                names: ['student_first_name', 'student_last_name'],
                restrictions,
              },
            ],
            requestedPredicates: [
              {
                name: 'expiry_date',
                predicateType: '>=',
                predicateValue: 20240101,
                restrictions,
              },
            ],
          },
        ],
      },
    },
  ]
  return defaultProofRequestTemplates
}
