type RequestWithUser = Request & {
  user: { organizationId: number; id: number; email: string };
};
