-- CreateIndex
CREATE INDEX "contacts_companyId_idx" ON "contacts"("companyId");
CREATE INDEX "enquiries_contactId_idx" ON "enquiries"("contactId");
CREATE INDEX "enquiries_companyId_idx" ON "enquiries"("companyId");
CREATE INDEX "quotations_enquiryId_idx" ON "quotations"("enquiryId");
CREATE INDEX "projects_companyId_idx" ON "projects"("companyId");
CREATE INDEX "payments_projectId_idx" ON "payments"("projectId");
CREATE INDEX "payments_quotationId_idx" ON "payments"("quotationId");
CREATE INDEX "tasks_enquiryId_idx" ON "tasks"("enquiryId");
CREATE INDEX "tasks_projectId_idx" ON "tasks"("projectId");