export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  __InternalSupabase: { PostgrestVersion: "14.4" }
  public: {
    Tables: {
      activity_log: {
        Row: { action: string; created_at: string | null; details: Json | null; entity_id: string | null; entity_type: string | null; id: string; user_id: string | null }
        Insert: { action: string; created_at?: string | null; details?: Json | null; entity_id?: string | null; entity_type?: string | null; id?: string; user_id?: string | null }
        Update: { action?: string; created_at?: string | null; details?: Json | null; entity_id?: string | null; entity_type?: string | null; id?: string; user_id?: string | null }
      }
      attachments: {
        Row: { created_at: string | null; entity_id: string; entity_type: string; file_name: string | null; id: string; mime_type: string | null; size_bytes: number | null; storage_path: string; uploaded_by: string | null }
        Insert: { created_at?: string | null; entity_id: string; entity_type: string; file_name?: string | null; id?: string; mime_type?: string | null; size_bytes?: number | null; storage_path: string; uploaded_by?: string | null }
        Update: { created_at?: string | null; entity_id?: string; entity_type?: string; file_name?: string | null; id?: string; mime_type?: string | null; size_bytes?: number | null; storage_path?: string; uploaded_by?: string | null }
      }
      environmental_records: {
        Row: { category: string | null; created_at: string | null; id: string; notes: string | null; parameter: string; project_id: string | null; record_date: string; recorded_by: string | null; status: Database["public"]["Enums"]["compliance_status"] | null; threshold_max: number | null; threshold_min: number | null; unit: string | null; value: number | null }
        Insert: { category?: string | null; created_at?: string | null; id?: string; notes?: string | null; parameter: string; project_id?: string | null; record_date: string; recorded_by?: string | null; status?: Database["public"]["Enums"]["compliance_status"] | null; threshold_max?: number | null; threshold_min?: number | null; unit?: string | null; value?: number | null }
        Update: { category?: string | null; created_at?: string | null; id?: string; notes?: string | null; parameter?: string; project_id?: string | null; record_date?: string; recorded_by?: string | null; status?: Database["public"]["Enums"]["compliance_status"] | null; threshold_max?: number | null; threshold_min?: number | null; unit?: string | null; value?: number | null }
      }
      epc_daily_reports: {
        Row: { activities: string | null; created_at: string | null; epc_system_id: string | null; equipment_status: string | null; id: string; manpower_count: number | null; remarks: string | null; report_date: string; reported_by: string | null; weather: string | null }
        Insert: { activities?: string | null; created_at?: string | null; epc_system_id?: string | null; equipment_status?: string | null; id?: string; manpower_count?: number | null; remarks?: string | null; report_date: string; reported_by?: string | null; weather?: string | null }
        Update: { activities?: string | null; created_at?: string | null; epc_system_id?: string | null; equipment_status?: string | null; id?: string; manpower_count?: number | null; remarks?: string | null; report_date?: string; reported_by?: string | null; weather?: string | null }
      }
      epc_systems: {
        Row: { actual_m: number | null; budget_m: number | null; category: string | null; contractor_org_id: string | null; created_at: string | null; deadline: string | null; display_order: number | null; icon: string | null; id: string; manufacturer_org_id: string | null; name: string; progress: number | null; project_id: string | null; quotation_m: number | null; status: Database["public"]["Enums"]["task_status"] | null; system_key: string; updated_at: string | null }
        Insert: { actual_m?: number | null; budget_m?: number | null; category?: string | null; contractor_org_id?: string | null; created_at?: string | null; deadline?: string | null; display_order?: number | null; icon?: string | null; id?: string; manufacturer_org_id?: string | null; name: string; progress?: number | null; project_id?: string | null; quotation_m?: number | null; status?: Database["public"]["Enums"]["task_status"] | null; system_key: string; updated_at?: string | null }
        Update: { actual_m?: number | null; budget_m?: number | null; category?: string | null; contractor_org_id?: string | null; created_at?: string | null; deadline?: string | null; display_order?: number | null; icon?: string | null; id?: string; manufacturer_org_id?: string | null; name?: string; progress?: number | null; project_id?: string | null; quotation_m?: number | null; status?: Database["public"]["Enums"]["task_status"] | null; system_key?: string; updated_at?: string | null }
      }
      equipment_items: {
        Row: { country_of_origin: string | null; created_at: string | null; description: string | null; epc_system_id: string | null; id: string; manufacturer_org_id: string | null; name: string; notes: string | null; po_number: string | null; project_id: string | null; quantity: number | null; unit_value: number | null; updated_at: string | null }
        Insert: { country_of_origin?: string | null; created_at?: string | null; description?: string | null; epc_system_id?: string | null; id?: string; manufacturer_org_id?: string | null; name: string; notes?: string | null; po_number?: string | null; project_id?: string | null; quantity?: number | null; unit_value?: number | null; updated_at?: string | null }
        Update: { country_of_origin?: string | null; created_at?: string | null; description?: string | null; epc_system_id?: string | null; id?: string; manufacturer_org_id?: string | null; name?: string; notes?: string | null; po_number?: string | null; project_id?: string | null; quantity?: number | null; unit_value?: number | null; updated_at?: string | null }
      }
      equipment_shipments: {
        Row: { arrived_date: string | null; bl_number: string | null; created_at: string | null; current_location: string | null; customs_status: string | null; equipment_item_id: string | null; eta_date: string | null; id: string; installed_date: string | null; manufacturing_start_date: string | null; notes: string | null; ready_date: string | null; ship_date: string | null; shipping_org_id: string | null; status: Database["public"]["Enums"]["shipment_status"] | null; updated_at: string | null }
        Insert: { arrived_date?: string | null; bl_number?: string | null; created_at?: string | null; current_location?: string | null; customs_status?: string | null; equipment_item_id?: string | null; eta_date?: string | null; id?: string; installed_date?: string | null; manufacturing_start_date?: string | null; notes?: string | null; ready_date?: string | null; ship_date?: string | null; shipping_org_id?: string | null; status?: Database["public"]["Enums"]["shipment_status"] | null; updated_at?: string | null }
        Update: { arrived_date?: string | null; bl_number?: string | null; created_at?: string | null; current_location?: string | null; customs_status?: string | null; equipment_item_id?: string | null; eta_date?: string | null; id?: string; installed_date?: string | null; manufacturing_start_date?: string | null; notes?: string | null; ready_date?: string | null; ship_date?: string | null; shipping_org_id?: string | null; status?: Database["public"]["Enums"]["shipment_status"] | null; updated_at?: string | null }
      }
      equity_calls: {
        Row: { amount: number; call_date: string; created_at: string | null; currency: string | null; id: string; investor_org_id: string | null; notes: string | null; project_id: string | null; reference: string | null; related_milestone_id: string | null }
        Insert: { amount: number; call_date: string; created_at?: string | null; currency?: string | null; id?: string; investor_org_id?: string | null; notes?: string | null; project_id?: string | null; reference?: string | null; related_milestone_id?: string | null }
        Update: { amount?: number; call_date?: string; created_at?: string | null; currency?: string | null; id?: string; investor_org_id?: string | null; notes?: string | null; project_id?: string | null; reference?: string | null; related_milestone_id?: string | null }
      }
      issues: {
        Row: { assignee_id: string | null; created_at: string | null; description: string | null; id: string; phase_id: string | null; reported_by: string | null; reported_date: string | null; resolution_notes: string | null; resolved_date: string | null; severity: Database["public"]["Enums"]["issue_severity"] | null; status: Database["public"]["Enums"]["issue_status"] | null; title: string; updated_at: string | null }
        Insert: { assignee_id?: string | null; created_at?: string | null; description?: string | null; id?: string; phase_id?: string | null; reported_by?: string | null; reported_date?: string | null; resolution_notes?: string | null; resolved_date?: string | null; severity?: Database["public"]["Enums"]["issue_severity"] | null; status?: Database["public"]["Enums"]["issue_status"] | null; title: string; updated_at?: string | null }
        Update: { assignee_id?: string | null; created_at?: string | null; description?: string | null; id?: string; phase_id?: string | null; reported_by?: string | null; reported_date?: string | null; resolution_notes?: string | null; resolved_date?: string | null; severity?: Database["public"]["Enums"]["issue_severity"] | null; status?: Database["public"]["Enums"]["issue_status"] | null; title?: string; updated_at?: string | null }
      }
      loan_drawdowns: {
        Row: { amount: number; bank_org_id: string | null; created_at: string | null; currency: string | null; drawdown_date: string; id: string; interest_rate: number | null; notes: string | null; project_id: string | null; reference: string | null; related_milestone_id: string | null }
        Insert: { amount: number; bank_org_id?: string | null; created_at?: string | null; currency?: string | null; drawdown_date: string; id?: string; interest_rate?: number | null; notes?: string | null; project_id?: string | null; reference?: string | null; related_milestone_id?: string | null }
        Update: { amount?: number; bank_org_id?: string | null; created_at?: string | null; currency?: string | null; drawdown_date?: string; id?: string; interest_rate?: number | null; notes?: string | null; project_id?: string | null; reference?: string | null; related_milestone_id?: string | null }
      }
      organizations: {
        Row: { contact_email: string | null; contact_phone: string | null; country: string | null; created_at: string | null; id: string; name: string; notes: string | null; org_type: Database["public"]["Enums"]["org_type"]; website: string | null }
        Insert: { contact_email?: string | null; contact_phone?: string | null; country?: string | null; created_at?: string | null; id?: string; name: string; notes?: string | null; org_type: Database["public"]["Enums"]["org_type"]; website?: string | null }
        Update: { contact_email?: string | null; contact_phone?: string | null; country?: string | null; created_at?: string | null; id?: string; name?: string; notes?: string | null; org_type?: Database["public"]["Enums"]["org_type"]; website?: string | null }
      }
      payment_milestones: {
        Row: { amount: number; created_at: string | null; description: string | null; due_date: string | null; funding_source: Database["public"]["Enums"]["funding_source"] | null; id: string; invoice_ref: string | null; name: string; paid_date: string | null; project_id: string | null; status: string | null; updated_at: string | null }
        Insert: { amount: number; created_at?: string | null; description?: string | null; due_date?: string | null; funding_source?: Database["public"]["Enums"]["funding_source"] | null; id?: string; invoice_ref?: string | null; name: string; paid_date?: string | null; project_id?: string | null; status?: string | null; updated_at?: string | null }
        Update: { amount?: number; created_at?: string | null; description?: string | null; due_date?: string | null; funding_source?: Database["public"]["Enums"]["funding_source"] | null; id?: string; invoice_ref?: string | null; name?: string; paid_date?: string | null; project_id?: string | null; status?: string | null; updated_at?: string | null }
      }
      permits: {
        Row: { authority: string | null; checklist: Json | null; created_at: string | null; expiry_date: string | null; id: string; issue_date: string | null; name: string; notes: string | null; progress: number | null; project_id: string | null; ref_number: string | null; status: Database["public"]["Enums"]["permit_status"] | null; updated_at: string | null }
        Insert: { authority?: string | null; checklist?: Json | null; created_at?: string | null; expiry_date?: string | null; id?: string; issue_date?: string | null; name: string; notes?: string | null; progress?: number | null; project_id?: string | null; ref_number?: string | null; status?: Database["public"]["Enums"]["permit_status"] | null; updated_at?: string | null }
        Update: { authority?: string | null; checklist?: Json | null; created_at?: string | null; expiry_date?: string | null; id?: string; issue_date?: string | null; name?: string; notes?: string | null; progress?: number | null; project_id?: string | null; ref_number?: string | null; status?: Database["public"]["Enums"]["permit_status"] | null; updated_at?: string | null }
      }
      permits_to_work: {
        Row: { approved_by: string | null; created_at: string | null; end_time: string | null; id: string; issued_to: string | null; location: string | null; project_id: string | null; ptw_number: string | null; ptw_type: string; start_time: string | null; status: string | null; updated_at: string | null; work_description: string | null }
        Insert: { approved_by?: string | null; created_at?: string | null; end_time?: string | null; id?: string; issued_to?: string | null; location?: string | null; project_id?: string | null; ptw_number?: string | null; ptw_type: string; start_time?: string | null; status?: string | null; updated_at?: string | null; work_description?: string | null }
        Update: { approved_by?: string | null; created_at?: string | null; end_time?: string | null; id?: string; issued_to?: string | null; location?: string | null; project_id?: string | null; ptw_number?: string | null; ptw_type?: string; start_time?: string | null; status?: string | null; updated_at?: string | null; work_description?: string | null }
      }
      phases: {
        Row: { created_at: string | null; display_order: number | null; end_date: string | null; icon: string | null; id: string; name: string; notes: string | null; phase_group: string; progress: number | null; project_id: string | null; start_date: string | null; status: Database["public"]["Enums"]["task_status"] | null; updated_at: string | null }
        Insert: { created_at?: string | null; display_order?: number | null; end_date?: string | null; icon?: string | null; id?: string; name: string; notes?: string | null; phase_group: string; progress?: number | null; project_id?: string | null; start_date?: string | null; status?: Database["public"]["Enums"]["task_status"] | null; updated_at?: string | null }
        Update: { created_at?: string | null; display_order?: number | null; end_date?: string | null; icon?: string | null; id?: string; name?: string; notes?: string | null; phase_group?: string; progress?: number | null; project_id?: string | null; start_date?: string | null; status?: Database["public"]["Enums"]["task_status"] | null; updated_at?: string | null }
      }
      profiles: {
        Row: { avatar_url: string | null; created_at: string | null; full_name: string; id: string; last_login_at: string | null; organization_id: string | null; phone: string | null; role: Database["public"]["Enums"]["user_role"] }
        Insert: { avatar_url?: string | null; created_at?: string | null; full_name: string; id: string; last_login_at?: string | null; organization_id?: string | null; phone?: string | null; role?: Database["public"]["Enums"]["user_role"] }
        Update: { avatar_url?: string | null; created_at?: string | null; full_name?: string; id?: string; last_login_at?: string | null; organization_id?: string | null; phone?: string | null; role?: Database["public"]["Enums"]["user_role"] }
      }
      project_members: {
        Row: { added_at: string | null; project_id: string; role_override: Database["public"]["Enums"]["user_role"] | null; user_id: string }
        Insert: { added_at?: string | null; project_id: string; role_override?: Database["public"]["Enums"]["user_role"] | null; user_id: string }
        Update: { added_at?: string | null; project_id?: string; role_override?: Database["public"]["Enums"]["user_role"] | null; user_id?: string }
      }
      projects: {
        Row: { capacity_mw: number | null; cod_target_date: string | null; code: string | null; created_at: string | null; id: string; location: string | null; name: string; start_date: string | null; status: string | null; updated_at: string | null }
        Insert: { capacity_mw?: number | null; cod_target_date?: string | null; code?: string | null; created_at?: string | null; id?: string; location?: string | null; name: string; start_date?: string | null; status?: string | null; updated_at?: string | null }
        Update: { capacity_mw?: number | null; cod_target_date?: string | null; code?: string | null; created_at?: string | null; id?: string; location?: string | null; name?: string; start_date?: string | null; status?: string | null; updated_at?: string | null }
      }
      safety_incidents: {
        Row: { created_at: string | null; description: string | null; id: string; incident_date: string; incident_type: string | null; location: string | null; project_id: string | null; reported_by: string | null; resolution: string | null; resolved_date: string | null; severity: Database["public"]["Enums"]["issue_severity"] | null; updated_at: string | null }
        Insert: { created_at?: string | null; description?: string | null; id?: string; incident_date: string; incident_type?: string | null; location?: string | null; project_id?: string | null; reported_by?: string | null; resolution?: string | null; resolved_date?: string | null; severity?: Database["public"]["Enums"]["issue_severity"] | null; updated_at?: string | null }
        Update: { created_at?: string | null; description?: string | null; id?: string; incident_date?: string; incident_type?: string | null; location?: string | null; project_id?: string | null; reported_by?: string | null; resolution?: string | null; resolved_date?: string | null; severity?: Database["public"]["Enums"]["issue_severity"] | null; updated_at?: string | null }
      }
      safety_inspections: {
        Row: { action_required: string | null; created_at: string | null; findings: string | null; id: string; inspection_date: string; inspection_type: string | null; inspector_id: string | null; location: string | null; project_id: string | null; status: string | null }
        Insert: { action_required?: string | null; created_at?: string | null; findings?: string | null; id?: string; inspection_date: string; inspection_type?: string | null; inspector_id?: string | null; location?: string | null; project_id?: string | null; status?: string | null }
        Update: { action_required?: string | null; created_at?: string | null; findings?: string | null; id?: string; inspection_date?: string; inspection_type?: string | null; inspector_id?: string | null; location?: string | null; project_id?: string | null; status?: string | null }
      }
      safety_trainings: {
        Row: { attendees: Json | null; created_at: string | null; id: string; notes: string | null; project_id: string | null; topic: string; trainer: string | null; training_date: string }
        Insert: { attendees?: Json | null; created_at?: string | null; id?: string; notes?: string | null; project_id?: string | null; topic: string; trainer?: string | null; training_date: string }
        Update: { attendees?: Json | null; created_at?: string | null; id?: string; notes?: string | null; project_id?: string | null; topic?: string; trainer?: string | null; training_date?: string }
      }
      tasks: {
        Row: { assignee_id: string | null; created_at: string | null; description: string | null; end_date: string | null; id: string; name: string; notes: string | null; phase_id: string | null; priority: Database["public"]["Enums"]["priority_level"] | null; progress: number | null; start_date: string | null; status: Database["public"]["Enums"]["task_status"] | null; updated_at: string | null }
        Insert: { assignee_id?: string | null; created_at?: string | null; description?: string | null; end_date?: string | null; id?: string; name: string; notes?: string | null; phase_id?: string | null; priority?: Database["public"]["Enums"]["priority_level"] | null; progress?: number | null; start_date?: string | null; status?: Database["public"]["Enums"]["task_status"] | null; updated_at?: string | null }
        Update: { assignee_id?: string | null; created_at?: string | null; description?: string | null; end_date?: string | null; id?: string; name?: string; notes?: string | null; phase_id?: string | null; priority?: Database["public"]["Enums"]["priority_level"] | null; progress?: number | null; start_date?: string | null; status?: Database["public"]["Enums"]["task_status"] | null; updated_at?: string | null }
      }
    }
    Views: { [_ in never]: never }
    Functions: {
      current_user_role: { Args: never; Returns: Database["public"]["Enums"]["user_role"] }
      has_role: { Args: { roles: Database["public"]["Enums"]["user_role"][] }; Returns: boolean }
      in_project: { Args: { pid: string }; Returns: boolean }
      is_finance_viewer: { Args: never; Returns: boolean }
      user_project_ids: { Args: never; Returns: string[] }
    }
    Enums: {
      compliance_status: "compliant" | "warning" | "exceeded"
      funding_source: "loan" | "equity" | "mixed"
      issue_severity: "low" | "medium" | "high" | "critical"
      issue_status: "open" | "in_progress" | "resolved" | "closed"
      org_type: "owner" | "epc" | "bank" | "investor" | "manufacturer" | "shipping" | "authority" | "other"
      permit_status: "pending" | "in_progress" | "obtained" | "expired" | "rejected"
      priority_level: "low" | "medium" | "high" | "critical"
      shipment_status: "planned" | "manufacturing" | "ready" | "in_transit" | "customs" | "arrived" | "installed"
      task_status: "not_started" | "pending" | "in_progress" | "completed" | "delayed" | "cancelled"
      user_role: "admin" | "epc_pm" | "engineer" | "worker" | "safety_officer" | "investor" | "bank" | "manufacturer" | "shipping"
    }
    CompositeTypes: { [_ in never]: never }
  }
}

export type UserRole = Database["public"]["Enums"]["user_role"]
export type Profile = Database["public"]["Tables"]["profiles"]["Row"]
export type Organization = Database["public"]["Tables"]["organizations"]["Row"]
export type Project = Database["public"]["Tables"]["projects"]["Row"]
export type ProjectMember = Database["public"]["Tables"]["project_members"]["Row"]
export type Phase = Database["public"]["Tables"]["phases"]["Row"]
export type Task = Database["public"]["Tables"]["tasks"]["Row"]
export type Issue = Database["public"]["Tables"]["issues"]["Row"]
export type EpcSystem = Database["public"]["Tables"]["epc_systems"]["Row"]
export type EquipmentItem = Database["public"]["Tables"]["equipment_items"]["Row"]
export type EquipmentShipment = Database["public"]["Tables"]["equipment_shipments"]["Row"]
export type Permit = Database["public"]["Tables"]["permits"]["Row"]
export type SafetyIncident = Database["public"]["Tables"]["safety_incidents"]["Row"]
export type PaymentMilestone = Database["public"]["Tables"]["payment_milestones"]["Row"]
export type LoanDrawdown = Database["public"]["Tables"]["loan_drawdowns"]["Row"]
export type EquityCall = Database["public"]["Tables"]["equity_calls"]["Row"]
