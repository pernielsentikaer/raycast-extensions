import { MutatePromise } from "@raycast/utils";

export type NextDNSError = {
  code: string;
  detail?: string;
  source?: {
    parameter: string;
  };
};

export type DomainListItem = {
  id: string;
  active: boolean;
};

export type Profile = {
  data: {
    id: string;
    name: string;
  };
};

export type Mutate = MutatePromise<{ result: DomainListItem[]; profileName: string; }>;