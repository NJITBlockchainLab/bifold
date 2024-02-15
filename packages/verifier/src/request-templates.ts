import { ProofRequestTemplate, ProofRequestType } from './types/proof-reqeust-template'

export const useProofRequestTemplates = (useDevRestrictions: boolean, attributes: Array<string>) => {
  const studentRestrictions = [{ cred_def_id: 'RtNBE1EPFr6N4wpiuGKN2z:3:CL:346020:issuer-kit-demo' }]
  const studentDevRestrictions = [{ schema_name: 'vehicle_credential' }]
  const restrictions = useDevRestrictions ? studentDevRestrictions : studentRestrictions
  const defaultProofRequestTemplates: Array<ProofRequestTemplate> = [
    {
      id: '1',
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
                names: attributes,
                restrictions,
              },
            ],
          },
        ],
      },
    },
    {
      id: '2',
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
                names: attributes,
                restrictions,
              },
            ],
            requestedPredicates: [
              {
                name: 'expiry',
                predicateType: '>=',
                predicateValue: parseInt(new Date().toLocaleDateString('en-US').replace('/', '')),
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
