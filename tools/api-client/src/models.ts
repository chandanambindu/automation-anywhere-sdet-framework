export interface AuthResponse {
  token?: string;
  accessToken?: string;
  idToken?: string;
  user?: any;
  tenantUuid?: string;
}

export interface RepositoryFile {
  id: string;
  uuid?: string;
  parentId?: string;
  workspaceId?: string;
  path?: string;
  type?: string;
  version?: number;
}

export interface CreateFilePayload {
  contentType: string;
  name: string;
  description?: string;
  parentFolderId?: string;
}

export interface SaveWorkflowContentPayload {
  // see existing captured payload pattern
  isProcessV2: boolean;
  nodes: any[];
  orphans: any[];
  variables: any[];
  swimlanes: any[];
  swimlaneStacking?: string;
}

export interface SaveFormContentPayload {
  form: FormPayload;
}

export interface FormPayload {
  properties: FormProperties;
  position?: FormPosition;
  meta?: { version?: string };
  rules?: any[];
  documentElement?: Record<string, any>;
  rows?: FormRow[];
  styles?: Record<string, any>;
}

export interface FormProperties {
  title?: string;
  dimension?: {
    height?: number;
    width?: number;
    displayHeight?: number;
  };
  font?: {
    fontType?: string;
    fontSize?: string;
  };
  closeOnEndMachine?: boolean;
  minimizeOnEndMachine?: boolean;
  hiddenElements?: string[];
  brandLogos?: any[];
  logoCount?: string;
}

export interface FormPosition {
  isFormPreviewCentered?: boolean;
  startX?: number;
  startY?: number;
  formPlacement?: string;
}

export interface FormRow {
  columns: FormColumn[];
}

export type FormColumn = FileColumn | TextBoxColumn | Record<string, any>;

export interface ColumnBase {
  type: string;
  fieldType?: string;
  id: string;
  label?: string;
  toolTip?: string;
  hintText?: string;
  mandatory?: boolean;
  hidden?: boolean;
}

export interface FileColumn extends ColumnBase {
  type: 'File';
  fieldType: 'File';
  readOnly?: boolean;
  supportedFileExtensions?: string[];
  width?: number;
  fileDownloadSupported?: boolean;
  unsupportedFileExtensions?: string[];
}

export interface TextBoxColumn extends ColumnBase {
  type: 'TextBox';
  fieldType: 'TextBox';
  defaultValue?: string;
  readOnly?: boolean;
  width?: number;
  minLength?: number;
  maxLength?: number;
  masked?: boolean;
  regex?: string;
  regexErrorMessage?: string;
  validationType?: string;
  hasFeatureCustomStyles?: boolean;
  value?: string;
}
