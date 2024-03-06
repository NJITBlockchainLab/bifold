import { ProofRequestTemplate, ProofRequestType } from './types/proof-reqeust-template'

export const useProofRequestTemplates = (useDevRestrictions: boolean, attributes: string[]) => {
  // console.error(parseInt(new Date().toLocaleDateString('en-US').split('/').join('')))
  const studentRestrictions = [{ cred_def_id: 'Lk3QLtTqp96teVc1x3H3oF:3:CL:427363:issuer-kit-demo' }]
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
            schema: 'Lk3QLtTqp96teVc1x3H3oF:2:vehicle_credential:0.1.0',
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
            schema: 'Lk3QLtTqp96teVc1x3H3oF:2:vehicle_credential:0.1.0',
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
                predicateValue: parseInt(new Date().toLocaleDateString('en-US').split('/').join('')),
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
