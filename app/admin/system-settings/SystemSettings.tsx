"use client";

import { useCallback, useEffect, useState } from "react";
import type { FormEvent, ReactNode } from "react";

const API_URL = "http://127.0.0.1:8000/api";
const DEFAULT_SESSION = "2026/2027";

type GradeBand = {
  id?: number;
  grade: string;
  min_score: number | string;
  max_score: number | string;
  grade_point: number | string;
  sort_order?: number;
};

type QualificationType = {
  id: number;
  name: string;
  short_name?: string | null;
  description?: string | null;
  is_active?: boolean;
};

type Programme = {
  id: number;
  name: string;
  short_name?: string | null;
  qualification_type_id?: number | null;
  qualification_type?: QualificationType | null;
  is_active?: boolean;
};

type GradingPolicy = {
  id: number;
  name: string;
  description?: string | null;
  gpa_scale: number;
  effective_session?: string | null;
  is_active: boolean;
  bands: GradeBand[];
  programmes?: Programme[];
  configured_by?: { id: number; name: string } | null;
};

type Course = {
  id: number;
  course_code: string | null;
  title: string;
  assessment_type?: string | null;
  department?: {
    school?: { programme?: Programme | null } | null;
  } | null;
};

type AssessmentRule = {
  id: number;
  course_id: number | null;
  assessment_type: string | null;
  qualification_type_id: number | null;
  ca_weight: number | string;
  exam_weight: number | string;
  effective_session: string | null;
  is_active: boolean;
  course?: Course | null;
  qualification_type?: QualificationType | null;
  configured_by?: { id: number; name: string } | null;
};

type RuleScope = "course" | "assessment_type" | "qualification_type";

type ApiResult<T> = {
  data?: T;
  message?: string;
  errors?: Record<string, string[]>;
  programmes?: T;
  courses?: T;
  qualification_types?: T;
  grading_policies?: T;
  assessment_rules?: T;
  [key: string]: unknown;
};

const inputClass =
  "w-full rounded-lg border border-slate-300 bg-white px-3 py-2.5 text-sm text-slate-800 outline-none focus:border-[#486581] focus:ring-2 focus:ring-[#486581]/20 disabled:cursor-not-allowed disabled:bg-slate-100";

const labelClass = "mb-1.5 block text-sm font-semibold text-slate-700";

const primaryButton =
  "rounded-lg bg-[#102A43] px-4 py-2.5 text-sm font-semibold text-white hover:bg-[#243B53] disabled:cursor-not-allowed disabled:opacity-50";

const secondaryButton =
  "rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm font-semibold text-[#102A43] hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-40";

const dangerButton =
  "rounded-lg border border-red-200 px-3 py-2 text-sm font-semibold text-red-700 hover:bg-red-50 disabled:cursor-not-allowed disabled:opacity-40";

const emptyBand = (): GradeBand => ({
  grade: "",
  min_score: 0,
  max_score: 100,
  grade_point: 0,
});

function extractList<T>(
  result: unknown,
  keys: string[] = [],
): T[] {
  if (Array.isArray(result)) {
    return result as T[];
  }

  if (!result || typeof result !== "object") {
    return [];
  }

  const response = result as Record<string, unknown>;

  for (const key of keys) {
    if (Array.isArray(response[key])) {
      return response[key] as T[];
    }
  }

  if (Array.isArray(response.data)) {
    return response.data as T[];
  }

  if (response.data && typeof response.data === "object") {
    const nested = response.data as Record<string, unknown>;

    for (const key of keys) {
      if (Array.isArray(nested[key])) {
        return nested[key] as T[];
      }
    }

    if (Array.isArray(nested.data)) {
      return nested.data as T[];
    }
  }

  return [];
}

function formatNumber(
  value: number | string | null | undefined,
): string {
  if (value === null || value === undefined || value === "") {
    return "—";
  }

  const number = Number(value);

  return Number.isFinite(number)
    ? number.toLocaleString()
    : "—";
}

function getErrorMessage(err: unknown): string {
  return err instanceof Error
    ? err.message
    : "An unexpected error occurred.";
}

function ErrorNotice({
  children,
  onDismiss,
}: {
  children: ReactNode;
  onDismiss: () => void;
}) {
  return (
    <div
      role="alert"
      className="flex items-start justify-between gap-3 rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-800"
    >
      <span>{children}</span>
      <button
        type="button"
        onClick={onDismiss}
        className="shrink-0 font-bold underline"
      >
        Dismiss
      </button>
    </div>
  );
}

function SuccessNotice({
  children,
  onDismiss,
}: {
  children: ReactNode;
  onDismiss: () => void;
}) {
  return (
    <div
      role="status"
      className="flex items-start justify-between gap-3 rounded-lg border border-green-200 bg-green-50 p-4 text-sm text-green-800"
    >
      <span>{children}</span>
      <button
        type="button"
        onClick={onDismiss}
        className="shrink-0 font-bold underline"
      >
        Dismiss
      </button>
    </div>
  );
}

function StatusBadge({ active }: { active: boolean }) {
  return (
    <span
      className={`rounded-full px-3 py-1 text-xs font-bold ${
        active
          ? "bg-green-100 text-green-800"
          : "bg-slate-200 text-slate-700"
      }`}
    >
      {active ? "ACTIVE" : "INACTIVE"}
    </span>
  );
}

export default function SystemSettings() {
  const [policies, setPolicies] = useState<GradingPolicy[]>([]);
  const [programmes, setProgrammes] = useState<Programme[]>([]);
  const [qualificationTypes, setQualificationTypes] = useState<
    QualificationType[]
  >([]);
  const [courses, setCourses] = useState<Course[]>([]);
  const [rules, setRules] = useState<AssessmentRule[]>([]);

  const [loadingPolicies, setLoadingPolicies] = useState(true);
  const [loadingProgrammes, setLoadingProgrammes] = useState(true);
  const [loadingQualifications, setLoadingQualifications] = useState(true);
  const [loadingCourses, setLoadingCourses] = useState(true);
  const [loadingRules, setLoadingRules] = useState(true);

  const [savingPolicy, setSavingPolicy] = useState(false);
  const [savingRule, setSavingRule] = useState(false);
  const [busyAction, setBusyAction] = useState<string | null>(null);

  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");
  const [metadataErrors, setMetadataErrors] = useState({
    programmes: "",
    qualifications: "",
    courses: "",
  });

  const [editingId, setEditingId] = useState<number | null>(null);
  const [editingRuleId, setEditingRuleId] = useState<number | null>(null);

  const [policyName, setPolicyName] = useState("");
  const [description, setDescription] = useState("");
  const [gpaScale, setGpaScale] = useState("");
  const [effectiveSession, setEffectiveSession] =
    useState(DEFAULT_SESSION);
  const [selectedProgrammeIds, setSelectedProgrammeIds] =
    useState<number[]>([]);
  const [bands, setBands] = useState<GradeBand[]>([emptyBand()]);

  const [ruleScope, setRuleScope] = useState<RuleScope>("course");
  const [ruleCourseId, setRuleCourseId] = useState("");
  const [ruleAssessmentType, setRuleAssessmentType] = useState("");
  const [ruleQualificationTypeId, setRuleQualificationTypeId] =
    useState("");
  const [ruleSession, setRuleSession] = useState(DEFAULT_SESSION);
  const [caWeight, setCaWeight] = useState("30");
  const [examWeight, setExamWeight] = useState("70");

  const apiRequest = useCallback(
    async <T,>(
      path: string,
      options: RequestInit = {},
    ): Promise<ApiResult<T> | T> => {
      const token =
        typeof window !== "undefined"
          ? window.localStorage.getItem("token")
          : null;

      if (!token) {
        throw new Error(
          "Your login token was not found. Please log in again.",
        );
      }

      const headers = new Headers(options.headers);
      headers.set("Accept", "application/json");
      headers.set("Authorization", `Bearer ${token}`);

      if (options.body && !headers.has("Content-Type")) {
        headers.set("Content-Type", "application/json");
      }

      let response: Response;

      try {
        response = await fetch(`${API_URL}${path}`, {
          ...options,
          headers,
          cache: "no-store",
        });
      } catch {
        throw new Error(
          "Cannot connect to Laravel at http://127.0.0.1:8000. Ensure the backend server is running.",
        );
      }

      const result = (await response.json().catch(() => ({}))) as ApiResult<T>;

      if (!response.ok) {
        if (response.status === 401) {
          throw new Error(
            `Authentication failed for ${path}. Your login token may be expired or invalid. Log in again.`,
          );
        }

        if (response.status === 403) {
          throw new Error(
            `You do not have permission to access ${path}. Contact the administrator if this is unexpected.`,
          );
        }

        const validationErrors = result.errors
          ? Object.values(result.errors).flat().join(" ")
          : "";

        throw new Error(
          validationErrors ||
            result.message ||
            `Request failed with HTTP ${response.status}.`,
        );
      }

      return result;
    },
    [],
  );

  const loadPolicies = useCallback(async () => {
    setLoadingPolicies(true);

    try {
      const result = await apiRequest<GradingPolicy[]>(
        "/admin/grading-policies",
      );

      setPolicies(
        extractList<GradingPolicy>(result, [
          "grading_policies",
          "policies",
        ]),
      );
    } catch (err) {
      setError(`Unable to load grading policies: ${getErrorMessage(err)}`);
    } finally {
      setLoadingPolicies(false);
    }
  }, [apiRequest]);

  // Each metadata request is independent. A course 401 must not
  // discard the programmes and qualification types that loaded correctly.
  const loadProgrammes = useCallback(async () => {
    setLoadingProgrammes(true);
    setMetadataErrors((current) => ({
      ...current,
      programmes: "",
    }));

    try {
      const result = await apiRequest<Programme[]>("/programmes");
      const list = extractList<Programme>(result, ["programmes"]);

      setProgrammes(list.filter((item) => item.is_active !== false));
    } catch (err) {
      setMetadataErrors((current) => ({
        ...current,
        programmes: getErrorMessage(err),
      }));
    } finally {
      setLoadingProgrammes(false);
    }
  }, [apiRequest]);

  const loadQualificationTypes = useCallback(async () => {
    setLoadingQualifications(true);
    setMetadataErrors((current) => ({
      ...current,
      qualifications: "",
    }));

    try {
      const result = await apiRequest<QualificationType[]>(
        "/qualification-types",
      );

      const list = extractList<QualificationType>(result, [
        "qualification_types",
        "qualificationTypes",
      ]);

      setQualificationTypes(
        list.filter((item) => item.is_active !== false),
      );
    } catch (err) {
      setMetadataErrors((current) => ({
        ...current,
        qualifications: getErrorMessage(err),
      }));
    } finally {
      setLoadingQualifications(false);
    }
  }, [apiRequest]);

  const loadCourses = useCallback(async () => {
    setLoadingCourses(true);
    setMetadataErrors((current) => ({
      ...current,
      courses: "",
    }));

    try {
      const result = await apiRequest<Course[]>("/courses");
      const list = extractList<Course>(result, ["courses"]);

      setCourses(list);
    } catch (err) {
      setMetadataErrors((current) => ({
        ...current,
        courses: getErrorMessage(err),
      }));
    } finally {
      setLoadingCourses(false);
    }
  }, [apiRequest]);

  const loadRules = useCallback(async () => {
    setLoadingRules(true);

    try {
      const result = await apiRequest<AssessmentRule[]>(
        "/admin/course-assessment-rules",
      );

      setRules(
        extractList<AssessmentRule>(result, [
          "assessment_rules",
          "rules",
        ]),
      );
    } catch (err) {
      setError(`Unable to load assessment rules: ${getErrorMessage(err)}`);
    } finally {
      setLoadingRules(false);
    }
  }, [apiRequest]);

  const refreshMetadata = useCallback(() => {
    void loadProgrammes();
    void loadQualificationTypes();
    void loadCourses();
  }, [loadProgrammes, loadQualificationTypes, loadCourses]);

  useEffect(() => {
    void loadPolicies();
    refreshMetadata();
    void loadRules();
  }, [loadPolicies, refreshMetadata, loadRules]);

  const resetPolicyForm = () => {
    setEditingId(null);
    setPolicyName("");
    setDescription("");
    setGpaScale("");
    setEffectiveSession(DEFAULT_SESSION);
    setSelectedProgrammeIds([]);
    setBands([emptyBand()]);
  };

  const resetRuleForm = () => {
    setEditingRuleId(null);
    setRuleScope("course");
    setRuleCourseId("");
    setRuleAssessmentType("");
    setRuleQualificationTypeId("");
    setRuleSession(DEFAULT_SESSION);
    setCaWeight("30");
    setExamWeight("70");
  };

  const startNewPolicy = () => {
    resetPolicyForm();
    setError("");
    setNotice("");
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const startNewRule = () => {
    resetRuleForm();
    setError("");
    setNotice("");
    document
      .getElementById("assessment-rule-form")
      ?.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  const updateBand = (
    index: number,
    field: keyof GradeBand,
    value: string,
  ) => {
    setBands((current) =>
      current.map((band, i) =>
        i === index ? { ...band, [field]: value } : band,
      ),
    );
  };

  const toggleProgramme = (programmeId: number) => {
    setSelectedProgrammeIds((current) =>
      current.includes(programmeId)
        ? current.filter((id) => id !== programmeId)
        : [...current, programmeId],
    );
  };

  const editPolicy = (policy: GradingPolicy) => {
    if (policy.is_active) {
      setError("Deactivate this grading policy before editing it.");
      return;
    }

    setEditingId(policy.id);
    setPolicyName(policy.name);
    setDescription(policy.description || "");
    setGpaScale(String(policy.gpa_scale));
    setEffectiveSession(policy.effective_session || "");
    setSelectedProgrammeIds(
      (policy.programmes || []).map((programme) => programme.id),
    );
    setBands(
      policy.bands?.length
        ? policy.bands.map((band) => ({ ...band }))
        : [emptyBand()],
    );
    setError("");
    setNotice("");
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const validateBands = (): string | null => {
    if (!bands.length) {
      return "Add at least one grade band.";
    }

    if (bands.some((band) => !band.grade.trim())) {
      return "Every grade band must have a grade label.";
    }

    if (
      bands.some(
        (band) =>
          band.min_score === "" ||
          band.max_score === "" ||
          band.grade_point === "" ||
          !Number.isFinite(Number(band.min_score)) ||
          !Number.isFinite(Number(band.max_score)) ||
          !Number.isFinite(Number(band.grade_point)),
      )
    ) {
      return "Enter valid numeric values for every grade band.";
    }

    const grades = bands.map((band) => band.grade.trim().toUpperCase());

    if (new Set(grades).size !== grades.length) {
      return "Each grade label must be unique.";
    }

    const sorted = bands
      .map((band) => ({
        min: Number(band.min_score),
        max: Number(band.max_score),
        point: Number(band.grade_point),
      }))
      .sort((a, b) => a.min - b.min);

    for (const band of sorted) {
      if (
        band.min < 0 ||
        band.max > 100 ||
        band.min > band.max ||
        band.point < 0 ||
        band.point > Number(gpaScale)
      ) {
        return "Scores must be within 0–100, minimum cannot exceed maximum, and grade points cannot exceed the GPA scale.";
      }

      if (
        Math.abs(band.min * 100 - Math.round(band.min * 100)) > 0.001 ||
        Math.abs(band.max * 100 - Math.round(band.max * 100)) > 0.001
      ) {
        return "Scores must use increments of 0.01.";
      }
    }

    if (Math.abs(sorted[0].min) > 0.001) {
      return "Grade bands must begin at 0.";
    }

    if (Math.abs(sorted[sorted.length - 1].max - 100) > 0.001) {
      return "Grade bands must end at 100.";
    }

    for (let i = 1; i < sorted.length; i++) {
      if (
        Math.abs(sorted[i].min - sorted[i - 1].max - 0.01) >
        0.001
      ) {
        return "Grade bands must cover 0–100 continuously in 0.01-point increments without gaps or overlaps.";
      }
    }

    return null;
  };

  const savePolicy = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError("");
    setNotice("");

    if (!policyName.trim()) {
      setError("Enter a name for the grading policy.");
      return;
    }

    if (
      !gpaScale.trim() ||
      !Number.isFinite(Number(gpaScale)) ||
      Number(gpaScale) <= 0 ||
      Number(gpaScale) > 100
    ) {
      setError("Enter a valid GPA scale greater than 0 and no greater than 100.");
      return;
    }

    if (!selectedProgrammeIds.length) {
      setError("Assign this grading policy to at least one programme.");
      return;
    }

    const bandError = validateBands();

    if (bandError) {
      setError(bandError);
      return;
    }

    const payload = {
      name: policyName.trim(),
      description: description.trim() || null,
      gpa_scale: Number(gpaScale),
      effective_session: effectiveSession.trim() || null,
      programme_ids: selectedProgrammeIds,
      bands: bands.map((band, index) => ({
        grade: band.grade.trim().toUpperCase(),
        min_score: Number(band.min_score),
        max_score: Number(band.max_score),
        grade_point: Number(band.grade_point),
        sort_order: index + 1,
      })),
    };

    setSavingPolicy(true);

    try {
      const path = editingId
        ? `/admin/grading-policies/${editingId}`
        : "/admin/grading-policies";

      await apiRequest(path, {
        method: editingId ? "PUT" : "POST",
        body: JSON.stringify(payload),
      });

      setNotice(
        editingId
          ? "Grading policy updated successfully."
          : "Grading policy created as inactive. Verify official approval before activation.",
      );

      resetPolicyForm();
      await loadPolicies();
    } catch (err) {
      setError(`Unable to save the grading policy: ${getErrorMessage(err)}`);
    } finally {
      setSavingPolicy(false);
    }
  };

  const activatePolicy = async (policy: GradingPolicy) => {
    if (!policy.programmes?.length) {
      setError(
        "This policy has no assigned programmes. Edit it and assign programmes before activation.",
      );
      return;
    }

    if (
      !window.confirm(
        `Activate "${policy.name}"? Ensure the grading scale and effective session have official approval.`,
      )
    ) {
      return;
    }

    setError("");
    setNotice("");
    setBusyAction(`policy-${policy.id}`);

    try {
      await apiRequest(`/admin/grading-policies/${policy.id}/activate`, {
        method: "POST",
      });

      setNotice(`"${policy.name}" has been activated.`);
      await loadPolicies();
    } catch (err) {
      setError(`Unable to activate policy: ${getErrorMessage(err)}`);
    } finally {
      setBusyAction(null);
    }
  };

  const deactivatePolicy = async (policy: GradingPolicy) => {
    if (!window.confirm(`Deactivate "${policy.name}"?`)) {
      return;
    }

    setError("");
    setNotice("");
    setBusyAction(`policy-${policy.id}`);

    try {
      await apiRequest(`/admin/grading-policies/${policy.id}/deactivate`, {
        method: "POST",
      });

      setNotice(`"${policy.name}" has been deactivated.`);
      await loadPolicies();
    } catch (err) {
      setError(`Unable to deactivate policy: ${getErrorMessage(err)}`);
    } finally {
      setBusyAction(null);
    }
  };

  const deletePolicy = async (policy: GradingPolicy) => {
    if (policy.is_active) {
      setError("Deactivate this policy before attempting to delete it.");
      return;
    }

    if (
      !window.confirm(
        `Permanently delete "${policy.name}" and its grade bands?`,
      )
    ) {
      return;
    }

    setError("");
    setNotice("");
    setBusyAction(`policy-${policy.id}`);

    try {
      await apiRequest(`/admin/grading-policies/${policy.id}`, {
        method: "DELETE",
      });

      if (editingId === policy.id) resetPolicyForm();

      setNotice(`"${policy.name}" was deleted.`);
      await loadPolicies();
    } catch (err) {
      setError(`Unable to delete policy: ${getErrorMessage(err)}`);
    } finally {
      setBusyAction(null);
    }
  };

  const editRule = (rule: AssessmentRule) => {
    if (rule.is_active) {
      setError("Deactivate this assessment rule before editing it.");
      return;
    }

    setEditingRuleId(rule.id);
    setRuleCourseId(rule.course_id ? String(rule.course_id) : "");
    setRuleAssessmentType(rule.assessment_type || "");
    setRuleQualificationTypeId(
      rule.qualification_type_id
        ? String(rule.qualification_type_id)
        : "",
    );
    setRuleSession(rule.effective_session || "");
    setCaWeight(String(rule.ca_weight));
    setExamWeight(String(rule.exam_weight));

    if (rule.course_id) {
      setRuleScope("course");
    } else if (rule.assessment_type) {
      setRuleScope("assessment_type");
    } else {
      setRuleScope("qualification_type");
    }

    setError("");
    setNotice("");

    document
      .getElementById("assessment-rule-form")
      ?.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  const saveRule = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError("");
    setNotice("");

    const ca = Number(caWeight);
    const exam = Number(examWeight);

    if (
      !caWeight.trim() ||
      !examWeight.trim() ||
      !Number.isFinite(ca) ||
      !Number.isFinite(exam) ||
      ca < 0 ||
      ca > 100 ||
      exam < 0 ||
      exam > 100
    ) {
      setError("Enter valid CA and examination weights between 0 and 100.");
      return;
    }

    if (Math.abs(ca + exam - 100) > 0.001) {
      setError(`CA and examination weights must total 100%. Current total: ${ca + exam}%.`);
      return;
    }

    if (ruleScope === "course" && !ruleCourseId) {
      setError("Select a course for this assessment rule.");
      return;
    }

    if (ruleScope === "assessment_type" && !ruleAssessmentType.trim()) {
      setError("Enter an assessment type.");
      return;
    }

    if (
      ruleScope === "qualification_type" &&
      !ruleQualificationTypeId
    ) {
      setError("Select a qualification type.");
      return;
    }

    const payload = {
      course_id: ruleScope === "course" ? Number(ruleCourseId) : null,
      assessment_type:
        ruleScope === "assessment_type"
          ? ruleAssessmentType.trim()
          : null,
      qualification_type_id:
        ruleScope === "qualification_type"
          ? Number(ruleQualificationTypeId)
          : null,
      ca_weight: ca,
      exam_weight: exam,
      effective_session: ruleSession.trim() || null,
    };

    setSavingRule(true);

    try {
      const path = editingRuleId
        ? `/admin/course-assessment-rules/${editingRuleId}`
        : "/admin/course-assessment-rules";

      await apiRequest(path, {
        method: editingRuleId ? "PUT" : "POST",
        body: JSON.stringify(payload),
      });

      setNotice(
        editingRuleId
          ? "Assessment rule updated successfully."
          : "Assessment rule created as inactive. Verify approved weights before activation.",
      );

      resetRuleForm();
      await loadRules();
    } catch (err) {
      setError(`Unable to save assessment rule: ${getErrorMessage(err)}`);
    } finally {
      setSavingRule(false);
    }
  };

  const toggleRuleActivation = async (
    rule: AssessmentRule,
    activate: boolean,
  ) => {
    const action = activate ? "activate" : "deactivate";

    if (
      !window.confirm(
        `${activate ? "Activate" : "Deactivate"} this assessment rule? Verify the approved scope and weights first.`,
      )
    ) {
      return;
    }

    setError("");
    setNotice("");
    setBusyAction(`rule-${rule.id}`);

    try {
      await apiRequest(
        `/admin/course-assessment-rules/${rule.id}/${action}`,
        { method: "POST" },
      );

      setNotice(
        `Assessment rule ${activate ? "activated" : "deactivated"} successfully.`,
      );

      await loadRules();
    } catch (err) {
      setError(`Unable to ${action} assessment rule: ${getErrorMessage(err)}`);
    } finally {
      setBusyAction(null);
    }
  };

  const deleteRule = async (rule: AssessmentRule) => {
    if (rule.is_active) {
      setError("Deactivate this assessment rule before deleting it.");
      return;
    }

    if (!window.confirm("Permanently delete this assessment rule?")) {
      return;
    }

    setError("");
    setNotice("");
    setBusyAction(`rule-${rule.id}`);

    try {
      await apiRequest(`/admin/course-assessment-rules/${rule.id}`, {
        method: "DELETE",
      });

      if (editingRuleId === rule.id) resetRuleForm();

      setNotice("Assessment rule deleted.");
      await loadRules();
    } catch (err) {
      setError(`Unable to delete assessment rule: ${getErrorMessage(err)}`);
    } finally {
      setBusyAction(null);
    }
  };

  const ruleScopeLabel = (rule: AssessmentRule) => {
    if (rule.course) {
      return `Course: ${rule.course.course_code || rule.course.title} — ${rule.course.title}`;
    }

    if (rule.assessment_type) {
      return `Assessment type: ${rule.assessment_type}`;
    }

    if (rule.qualification_type) {
      return `Qualification: ${rule.qualification_type.name}`;
    }

    if (rule.course_id) return `Course ID: ${rule.course_id}`;

    if (rule.qualification_type_id) {
      return `Qualification ID: ${rule.qualification_type_id}`;
    }

    return "Unspecified scope";
  };

  const combinedWeight = Number(caWeight) + Number(examWeight);
  const weightsValid =
    caWeight.trim() !== "" &&
    examWeight.trim() !== "" &&
    Number.isFinite(combinedWeight) &&
    Math.abs(combinedWeight - 100) < 0.001;

  return (
    <section className="space-y-8">
      {error && (
        <ErrorNotice onDismiss={() => setError("")}>
          {error}
        </ErrorNotice>
      )}

      {notice && (
        <SuccessNotice onDismiss={() => setNotice("")}>
          {notice}
        </SuccessNotice>
      )}

      <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
        <h2 className="text-2xl font-bold text-[#102A43]">
          Institution Settings
        </h2>
        <p className="mt-2 text-sm text-slate-600">
          Institution information displayed by the COELS system.
        </p>

        <div className="mt-6 grid gap-5">
          <div>
            <label className={labelClass}>College Name</label>
            <input
              readOnly
              value="College of Education and Legal Studies"
              className={inputClass}
            />
          </div>
          <div>
            <label className={labelClass}>Motto</label>
            <input
              readOnly
              value="KNOWLEDGE IS TREASURE."
              className={inputClass}
            />
          </div>
          <div>
            <label className={labelClass}>Address</label>
            <input
              readOnly
              value="Nguru, Yobe State, PMB 021"
              className={inputClass}
            />
          </div>
        </div>

        <p className="mt-4 text-xs text-slate-500">
          These fields are read-only because a persistent institution-settings
          API has not been connected.
        </p>
      </section>

      <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
        <h2 className="text-2xl font-bold text-[#102A43]">
          Academic Settings
        </h2>

        <div className="mt-6 grid gap-5 md:grid-cols-2">
          <div>
            <label className={labelClass}>Academic Session</label>
            <input
              readOnly
              value={DEFAULT_SESSION}
              className={inputClass}
            />
          </div>
          <div>
            <label className={labelClass}>Current Semester</label>
            <input
              readOnly
              value="Managed through academic session settings"
              className={inputClass}
            />
          </div>
        </div>

        <p className="mt-4 text-xs text-slate-500">
          These fields are display-only. Grading policies and assessment rules
          have separate effective-session fields.
        </p>
      </section>

      <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
        <div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-center">
          <div>
            <h2 className="text-2xl font-bold text-[#102A43]">
              Grading Policy Configuration
            </h2>
            <p className="mt-2 text-sm leading-6 text-slate-600">
              Create programme-specific grading policies using officially
              approved COELS grade bands. New policies remain inactive until
              explicitly activated.
            </p>
          </div>
          <button
            type="button"
            onClick={startNewPolicy}
            className={secondaryButton}
          >
            New Policy
          </button>
        </div>

        <form
          onSubmit={savePolicy}
          className="mt-6 space-y-6 rounded-xl border border-slate-200 bg-slate-50 p-4 sm:p-6"
        >
          <div>
            <h3 className="text-lg font-bold text-[#102A43]">
              {editingId ? "Edit Grading Policy" : "Create Grading Policy"}
            </h3>
            <p className="mt-1 text-sm text-slate-600">
              Grade bands must cover 0–100 without gaps or overlaps.
            </p>
          </div>

          <div className="grid gap-5 md:grid-cols-2">
            <div>
              <label className={labelClass}>Policy Name</label>
              <input
                value={policyName}
                onChange={(event) => setPolicyName(event.target.value)}
                required
                maxLength={150}
                placeholder="Approved Academic Grading Policy"
                className={inputClass}
              />
            </div>

            <div>
              <label className={labelClass}>Maximum GPA Scale</label>
              <input
                type="number"
                min="0.01"
                max="100"
                step="0.01"
                value={gpaScale}
                onChange={(event) => setGpaScale(event.target.value)}
                required
                placeholder="Enter approved GPA scale"
                className={inputClass}
              />
            </div>

            <div>
              <label className={labelClass}>Effective Academic Session</label>
              <input
                value={effectiveSession}
                onChange={(event) => setEffectiveSession(event.target.value)}
                maxLength={20}
                placeholder="e.g. 2026/2027"
                className={inputClass}
              />
            </div>

            <div>
              <label className={labelClass}>
                Description / Approval Reference
              </label>
              <textarea
                value={description}
                onChange={(event) => setDescription(event.target.value)}
                maxLength={5000}
                rows={3}
                placeholder="Official approval reference"
                className={inputClass}
              />
            </div>
          </div>

          <div>
            <div className="flex flex-wrap items-center justify-between gap-3">
              <h4 className="font-bold text-[#102A43]">Assign Programmes</h4>
              <button
                type="button"
                onClick={refreshMetadata}
                className={secondaryButton}
              >
                Refresh Lists
              </button>
            </div>

            <p className="mb-3 mt-1 text-sm text-slate-600">
              Select every programme this policy should cover.
            </p>

            {loadingProgrammes ? (
              <p className="text-sm text-slate-500">Loading programmes...</p>
            ) : metadataErrors.programmes ? (
              <p className="rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-800">
                Programme loading failed: {metadataErrors.programmes}
              </p>
            ) : programmes.length === 0 ? (
              <p className="rounded-lg border border-amber-200 bg-amber-50 p-3 text-sm text-amber-900">
                No active programmes were returned by the API.
              </p>
            ) : (
              <div className="grid gap-3 sm:grid-cols-2">
                {programmes.map((programme) => (
                  <label
                    key={programme.id}
                    className="flex cursor-pointer items-start gap-3 rounded-lg border border-slate-200 bg-white p-3"
                  >
                    <input
                      type="checkbox"
                      checked={selectedProgrammeIds.includes(programme.id)}
                      onChange={() => toggleProgramme(programme.id)}
                      className="mt-1 h-4 w-4"
                    />
                    <span>
                      <span className="block font-semibold text-slate-800">
                        {programme.name}
                      </span>
                      <span className="block text-xs text-slate-500">
                        {programme.qualification_type?.name ||
                          qualificationTypes.find(
                            (item) =>
                              item.id === programme.qualification_type_id,
                          )?.name ||
                          "Qualification not specified"}
                      </span>
                    </span>
                  </label>
                ))}
              </div>
            )}

            <p className="mt-2 text-xs text-slate-500">
              Selected: {selectedProgrammeIds.length} programme(s)
            </p>
          </div>

          <div>
            <div className="mb-4 flex flex-col justify-between gap-3 sm:flex-row sm:items-center">
              <div>
                <h4 className="font-bold text-[#102A43]">Grade Bands</h4>
                <p className="mt-1 text-xs leading-5 text-slate-600">
                  Use officially approved values only.
                </p>
              </div>
              <button
                type="button"
                onClick={() =>
                  setBands((current) => [...current, emptyBand()])
                }
                className={secondaryButton}
              >
                + Add Grade Band
              </button>
            </div>

            <div className="space-y-4">
              {bands.map((band, index) => (
                <div
                  key={index}
                  className="grid gap-3 rounded-lg border border-slate-200 bg-white p-4 sm:grid-cols-2 lg:grid-cols-5"
                >
                  <div>
                    <label className={labelClass}>Grade</label>
                    <input
                      value={band.grade}
                      onChange={(event) =>
                        updateBand(index, "grade", event.target.value)
                      }
                      required
                      maxLength={5}
                      placeholder="e.g. A"
                      className={inputClass}
                    />
                  </div>

                  <div>
                    <label className={labelClass}>Minimum Score</label>
                    <input
                      type="number"
                      min="0"
                      max="100"
                      step="0.01"
                      value={band.min_score}
                      onChange={(event) =>
                        updateBand(index, "min_score", event.target.value)
                      }
                      required
                      className={inputClass}
                    />
                  </div>

                  <div>
                    <label className={labelClass}>Maximum Score</label>
                    <input
                      type="number"
                      min="0"
                      max="100"
                      step="0.01"
                      value={band.max_score}
                      onChange={(event) =>
                        updateBand(index, "max_score", event.target.value)
                      }
                      required
                      className={inputClass}
                    />
                  </div>

                  <div>
                    <label className={labelClass}>Grade Point</label>
                    <input
                      type="number"
                      min="0"
                      max={gpaScale || undefined}
                      step="0.01"
                      value={band.grade_point}
                      onChange={(event) =>
                        updateBand(index, "grade_point", event.target.value)
                      }
                      required
                      className={inputClass}
                    />
                  </div>

                  <div className="flex items-end">
                    <button
                      type="button"
                      disabled={bands.length === 1}
                      onClick={() =>
                        setBands((current) =>
                          current.filter((_, i) => i !== index),
                        )
                      }
                      className={`${dangerButton} w-full`}
                    >
                      Remove Band
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="flex flex-col gap-3 sm:flex-row">
            <button
              type="submit"
              disabled={
                savingPolicy ||
                loadingProgrammes ||
                programmes.length === 0
              }
              className={primaryButton}
            >
              {savingPolicy
                ? "Saving..."
                : editingId
                  ? "Update Policy"
                  : "Save Grading Policy"}
            </button>

            {editingId !== null && (
              <button
                type="button"
                onClick={resetPolicyForm}
                disabled={savingPolicy}
                className={secondaryButton}
              >
                Cancel Editing
              </button>
            )}
          </div>
        </form>

        <div className="mt-8">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <h3 className="text-lg font-bold text-[#102A43]">
              Saved Grading Policies
            </h3>
            <button
              type="button"
              onClick={() => void loadPolicies()}
              disabled={loadingPolicies}
              className={secondaryButton}
            >
              {loadingPolicies ? "Refreshing..." : "Refresh"}
            </button>
          </div>

          {loadingPolicies ? (
            <p className="mt-4 text-sm text-slate-500">
              Loading grading policies...
            </p>
          ) : policies.length === 0 ? (
            <div className="mt-4 rounded-lg border border-dashed border-slate-300 p-6 text-center">
              <p className="font-semibold text-slate-700">
                No grading policies found
              </p>
            </div>
          ) : (
            <div className="mt-4 space-y-5">
              {policies.map((policy) => {
                const busy = busyAction === `policy-${policy.id}`;

                return (
                  <article
                    key={policy.id}
                    className="overflow-hidden rounded-xl border border-slate-200"
                  >
                    <div className="flex flex-col justify-between gap-4 bg-slate-50 p-5 sm:flex-row sm:items-start">
                      <div className="min-w-0">
                        <div className="flex flex-wrap items-center gap-2">
                          <h4 className="text-lg font-bold text-[#102A43]">
                            {policy.name}
                          </h4>
                          <StatusBadge active={policy.is_active} />
                        </div>

                        <p className="mt-2 text-sm text-slate-600">
                          GPA scale: {formatNumber(policy.gpa_scale)}
                        </p>
                        <p className="mt-1 text-sm text-slate-600">
                          Effective session:{" "}
                          {policy.effective_session || "Not specified"}
                        </p>
                        <p className="mt-1 text-sm text-slate-600">
                          Programmes:{" "}
                          {policy.programmes?.length
                            ? policy.programmes
                                .map((item) => item.name)
                                .join(", ")
                            : "None assigned"}
                        </p>

                        {policy.description && (
                          <p className="mt-2 whitespace-pre-wrap text-sm text-slate-600">
                            {policy.description}
                          </p>
                        )}

                        {policy.configured_by && (
                          <p className="mt-2 text-xs text-slate-500">
                            Configured by {policy.configured_by.name}
                          </p>
                        )}
                      </div>

                      <div className="flex shrink-0 flex-wrap gap-2">
                        <button
                          type="button"
                          disabled={policy.is_active || busy}
                          onClick={() => editPolicy(policy)}
                          className={secondaryButton}
                        >
                          Edit
                        </button>

                        {!policy.is_active ? (
                          <button
                            type="button"
                            disabled={busy}
                            onClick={() => void activatePolicy(policy)}
                            className="rounded-lg bg-green-700 px-3 py-2 text-sm font-semibold text-white hover:bg-green-800 disabled:opacity-50"
                          >
                            {busy ? "Working..." : "Activate"}
                          </button>
                        ) : (
                          <button
                            type="button"
                            disabled={busy}
                            onClick={() => void deactivatePolicy(policy)}
                            className="rounded-lg border border-amber-300 bg-white px-3 py-2 text-sm font-semibold text-amber-800 hover:bg-amber-50 disabled:opacity-50"
                          >
                            {busy ? "Working..." : "Deactivate"}
                          </button>
                        )}

                        <button
                          type="button"
                          disabled={policy.is_active || busy}
                          onClick={() => void deletePolicy(policy)}
                          className={dangerButton}
                        >
                          Delete
                        </button>
                      </div>
                    </div>

                    <div className="overflow-x-auto">
                      <table className="w-full min-w-[520px] text-left text-sm">
                        <thead className="bg-white text-xs uppercase text-slate-500">
                          <tr>
                            <th className="px-4 py-3">Grade</th>
                            <th className="px-4 py-3">Minimum</th>
                            <th className="px-4 py-3">Maximum</th>
                            <th className="px-4 py-3">Grade Point</th>
                          </tr>
                        </thead>
                        <tbody>
                          {(policy.bands || []).map((band, index) => (
                            <tr
                              key={`${policy.id}-${band.grade}-${index}`}
                              className="border-t border-slate-100"
                            >
                              <td className="px-4 py-3 font-semibold">
                                {band.grade}
                              </td>
                              <td className="px-4 py-3">
                                {formatNumber(band.min_score)}
                              </td>
                              <td className="px-4 py-3">
                                {formatNumber(band.max_score)}
                              </td>
                              <td className="px-4 py-3">
                                {formatNumber(band.grade_point)}
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </article>
                );
              })}
            </div>
          )}
        </div>

        <div className="mt-6 rounded-lg border border-amber-200 bg-amber-50 p-4 text-sm leading-6 text-amber-900">
          <strong>Academic safeguard:</strong> Activating a grading policy
          does not automatically implement GPA/CGPA calculations or
          repeat-course handling. Those functions require separate
          integration with approved academic rules.
        </div>
      </section>

      <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
        <div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-center">
          <div>
            <h2 className="text-2xl font-bold text-[#102A43]">
              Assessment Weight Configuration
            </h2>
            <p className="mt-2 text-sm leading-6 text-slate-600">
              Configure continuous assessment and examination weights by
              course, assessment type or qualification type.
            </p>
          </div>
          <button
            type="button"
            onClick={startNewRule}
            className={secondaryButton}
          >
            New Rule
          </button>
        </div>

        <form
          id="assessment-rule-form"
          onSubmit={saveRule}
          className="mt-6 space-y-5 rounded-xl border border-slate-200 bg-slate-50 p-4 sm:p-6"
        >
          <h3 className="text-lg font-bold text-[#102A43]">
            {editingRuleId ? "Edit Assessment Rule" : "Create Assessment Rule"}
          </h3>

          <div>
            <label className={labelClass}>Rule Scope</label>
            <select
              value={ruleScope}
              onChange={(event) => {
                setRuleScope(event.target.value as RuleScope);
                setRuleCourseId("");
                setRuleAssessmentType("");
                setRuleQualificationTypeId("");
              }}
              className={inputClass}
            >
              <option value="course">Specific course</option>
              <option value="assessment_type">Assessment type</option>
              <option value="qualification_type">Qualification type</option>
            </select>
          </div>

          {ruleScope === "course" && (
            <div>
              <label className={labelClass}>Course</label>
              <select
                value={ruleCourseId}
                onChange={(event) => setRuleCourseId(event.target.value)}
                required
                className={inputClass}
              >
                <option value="">Select a course</option>
                {courses.map((course) => (
                  <option key={course.id} value={course.id}>
                    {course.course_code
                      ? `${course.course_code} — ${course.title}`
                      : course.title}
                    {course.department?.school?.programme?.name
                      ? ` (${course.department.school.programme.name})`
                      : ""}
                  </option>
                ))}
              </select>

              {loadingCourses && (
                <p className="mt-1 text-xs text-slate-500">
                  Loading courses...
                </p>
              )}

              {!loadingCourses && metadataErrors.courses && (
                <div className="mt-2 rounded-lg border border-amber-200 bg-amber-50 p-3 text-sm text-amber-900">
                  <p>
                    Courses could not be loaded: {metadataErrors.courses}
                  </p>
                  <button
                    type="button"
                    onClick={() => void loadCourses()}
                    className="mt-2 font-semibold underline"
                  >
                    Retry course loading
                  </button>
                </div>
              )}

              {!loadingCourses &&
                !metadataErrors.courses &&
                courses.length === 0 && (
                  <p className="mt-1 text-xs text-amber-800">
                    No courses were returned by the API.
                  </p>
                )}
            </div>
          )}

          {ruleScope === "assessment_type" && (
            <div>
              <label className={labelClass}>Assessment Type</label>
              <input
                value={ruleAssessmentType}
                onChange={(event) =>
                  setRuleAssessmentType(event.target.value)
                }
                required
                maxLength={30}
                placeholder="Enter the assessment type used by COELS"
                className={inputClass}
              />
            </div>
          )}

          {ruleScope === "qualification_type" && (
            <div>
              <label className={labelClass}>Qualification Type</label>
              <select
                value={ruleQualificationTypeId}
                onChange={(event) =>
                  setRuleQualificationTypeId(event.target.value)
                }
                required
                className={inputClass}
              >
                <option value="">Select a qualification type</option>
                {qualificationTypes.map((qualification) => (
                  <option
                    key={qualification.id}
                    value={qualification.id}
                  >
                    {qualification.name}
                    {qualification.short_name
                      ? ` (${qualification.short_name})`
                      : ""}
                  </option>
                ))}
              </select>

              {metadataErrors.qualifications && (
                <p className="mt-1 text-sm text-red-700">
                  {metadataErrors.qualifications}
                </p>
              )}
            </div>
          )}

          <div>
            <label className={labelClass}>Effective Academic Session</label>
            <input
              value={ruleSession}
              onChange={(event) => setRuleSession(event.target.value)}
              maxLength={20}
              placeholder="e.g. 2026/2027"
              className={inputClass}
            />
          </div>

          <div className="grid gap-5 sm:grid-cols-2">
            <div>
              <label className={labelClass}>CA Weight (%)</label>
              <input
                type="number"
                min="0"
                max="100"
                step="0.01"
                value={caWeight}
                onChange={(event) => setCaWeight(event.target.value)}
                required
                className={inputClass}
              />
            </div>

            <div>
              <label className={labelClass}>Examination Weight (%)</label>
              <input
                type="number"
                min="0"
                max="100"
                step="0.01"
                value={examWeight}
                onChange={(event) => setExamWeight(event.target.value)}
                required
                className={inputClass}
              />
            </div>
          </div>

          <p
            className={`text-sm font-semibold ${
              weightsValid ? "text-green-700" : "text-amber-800"
            }`}
          >
            Combined weight:{" "}
            {Number.isFinite(combinedWeight) ? combinedWeight : "—"}%
            {weightsValid ? " — Valid" : " — Must total 100%"}
          </p>

          <div className="flex flex-wrap gap-3">
            <button
              type="submit"
              disabled={savingRule}
              className={primaryButton}
            >
              {savingRule
                ? "Saving..."
                : editingRuleId
                  ? "Update Assessment Rule"
                  : "Save Assessment Rule"}
            </button>

            {editingRuleId !== null && (
              <button
                type="button"
                onClick={resetRuleForm}
                disabled={savingRule}
                className={secondaryButton}
              >
                Cancel Editing
              </button>
            )}
          </div>
        </form>

        <div className="mt-8">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <h3 className="text-lg font-bold text-[#102A43]">
              Saved Assessment Rules
            </h3>
            <button
              type="button"
              onClick={() => void loadRules()}
              disabled={loadingRules}
              className={secondaryButton}
            >
              {loadingRules ? "Refreshing..." : "Refresh"}
            </button>
          </div>

          {loadingRules ? (
            <p className="mt-4 text-sm text-slate-500">
              Loading assessment rules...
            </p>
          ) : rules.length === 0 ? (
            <div className="mt-4 rounded-lg border border-dashed border-slate-300 p-6 text-center">
              <p className="font-semibold text-slate-700">
                No assessment rules found
              </p>
              <p className="mt-2 text-sm text-slate-500">
                Create a rule using the officially approved assessment
                structure.
              </p>
            </div>
          ) : (
            <div className="mt-4 space-y-4">
              {rules.map((rule) => {
                const busy = busyAction === `rule-${rule.id}`;

                return (
                  <article
                    key={rule.id}
                    className="rounded-xl border border-slate-200 p-4"
                  >
                    <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-start">
                      <div className="min-w-0">
                        <div className="flex flex-wrap items-center gap-2">
                          <h4 className="font-bold text-[#102A43]">
                            {ruleScopeLabel(rule)}
                          </h4>
                          <StatusBadge active={rule.is_active} />
                        </div>

                        <p className="mt-2 text-sm text-slate-600">
                          CA: {formatNumber(rule.ca_weight)}% · Examination:{" "}
                          {formatNumber(rule.exam_weight)}%
                        </p>
                        <p className="mt-1 text-sm text-slate-600">
                          Effective session:{" "}
                          {rule.effective_session || "Not specified"}
                        </p>

                        {rule.configured_by && (
                          <p className="mt-1 text-xs text-slate-500">
                            Configured by {rule.configured_by.name}
                          </p>
                        )}
                      </div>

                      <div className="flex shrink-0 flex-wrap gap-2">
                        <button
                          type="button"
                          disabled={rule.is_active || busy}
                          onClick={() => editRule(rule)}
                          className={secondaryButton}
                        >
                          Edit
                        </button>

                        <button
                          type="button"
                          disabled={busy}
                          onClick={() =>
                            void toggleRuleActivation(rule, !rule.is_active)
                          }
                          className={
                            rule.is_active
                              ? "rounded-lg border border-amber-300 px-3 py-2 text-sm font-semibold text-amber-800 hover:bg-amber-50 disabled:opacity-50"
                              : "rounded-lg bg-green-700 px-3 py-2 text-sm font-semibold text-white hover:bg-green-800 disabled:opacity-50"
                          }
                        >
                          {busy
                            ? "Working..."
                            : rule.is_active
                              ? "Deactivate"
                              : "Activate"}
                        </button>

                        <button
                          type="button"
                          disabled={rule.is_active || busy}
                          onClick={() => void deleteRule(rule)}
                          className={dangerButton}
                        >
                          Delete
                        </button>
                      </div>
                    </div>
                  </article>
                );
              })}
            </div>
          )}
        </div>

        <div className="mt-6 rounded-lg border border-amber-200 bg-amber-50 p-4 text-sm leading-6 text-amber-900">
          <strong>Important:</strong> Saving an assessment rule does not
          automatically change existing student scores or results
          calculations. Integration with approved active rules must be
          handled separately.
        </div>
      </section>

      <section className="rounded-2xl border border-slate-200 bg-slate-50 p-6">
        <h2 className="text-xl font-bold text-[#102A43]">
          Security &amp; Account Rules
        </h2>
        <ul className="mt-4 list-inside list-disc space-y-2 text-sm leading-6 text-slate-700">
          <li>Staff accounts are created by authorised administrators and HODs.</li>
          <li>Temporary passwords should be generated securely.</li>
          <li>Temporary passwords should be sent through approved channels.</li>
          <li>Users should change temporary passwords at first login.</li>
          <li>Staff permissions should be restricted by role and department.</li>
          <li>Important administrative actions should be recorded in the audit log.</li>
        </ul>
      </section>
    </section>
  );
}