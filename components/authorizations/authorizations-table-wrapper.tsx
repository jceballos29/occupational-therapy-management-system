"use client";

import { AuthorizationsDataTable } from "./data-table";
import { getAuthorizationColumns } from "./columns";
import { Authorization } from "@/lib/generated/prisma/browser";

interface AuthorizationsTableWrapperProps {
  authorizations: Authorization[];
}

export function AuthorizationsTableWrapper({
  authorizations,
}: AuthorizationsTableWrapperProps) {
  const columns = getAuthorizationColumns();

  return <AuthorizationsDataTable columns={columns} data={authorizations} />;
}
