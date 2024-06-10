import { Permission, PermissionStatus, Rationale } from 'react-native-permissions'
export type PermissionContract = (permission: Permission, rationale?: Rationale) => Promise<PermissionStatus>
export type MultiplePermissionContract = (
  permission: Permission[],
  rationale?: Rationale
) => Promise<Record<Permission[number], PermissionStatus>>
