import { ProofRequestTemplate, ProofRequestType } from './types/proof-reqeust-template'

export const useProofRequestTemplates = (useDevRestrictions: boolean, attributes: string[]) => {
  const currentDate = new Date().toLocaleDateString('en-US').split('/')
  const todayDate = parseInt(
    currentDate[2] +
      (currentDate[0].length === 1 ? '0' + currentDate[0] : currentDate[0]) +
      (currentDate[1].length === 1 ? '0' + currentDate[1] : currentDate[1])
  )
  const studentRestrictions = [{ cred_def_id: 'PpeCJT3zbNck91wFivyY8N:3:CL:16:fhwa-vdkms-ca' }]
  const schema_id = 'PpeCJT3zbNck91wFivyY8N:2:vehicle_credential:0.1.0'
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
            schema: schema_id,
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
            schema: schema_id,
            requestedAttributes: [
              {
                names: attributes,
                restrictions,
              },
            ],
            requestedPredicates: [
              {
                name: 'expiry_date',
                predicateType: '>=',
                predicateValue: todayDate,
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
