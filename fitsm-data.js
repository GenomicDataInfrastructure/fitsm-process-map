// SPDX-FileCopyrightText: ITEMO e.V. (FitSM content)
// SPDX-FileCopyrightText: 2026 PNED G.I.E.
//
// SPDX-License-Identifier: CC-BY-4.0

/*
 * FitSM process model data.
 * Sources (all CC BY 4.0, ITEMO e.V., www.fitsm.eu):
 *   FitSM-0 Overview and vocabulary v3.0   – definitions (databases, records)
 *   FitSM-1 Requirements v3.0.1            – PR1–PR14 requirements
 *   FitSM-2 Process activities v3.0.2      – objectives, activities, inputs/outputs, key interfaces
 *   FitSM-3 Role model v3.0.1              – roles and tasks
 */

const GROUPS = {
  agree:   { name: "Portfolio, levels & reporting" },
  quality: { name: "Service quality" },
  rel:     { name: "Relationships" },
  ops:     { name: "Operations" },
  control: { name: "Control" },
  improve: { name: "Improvement" }
};

/* FitSM-3 §5 – common tasks shared by every process */
const GENERIC_TASKS = {
  owner: [
    "Act as the primary contact point for concerns in the context of governing one specific ITSM process.",
    "Define and approve goals and policies in the context of the process according to the overall SMS goals and policies.",
    "Nominate the process manager, and ensure they are competent to fulfil this role.",
    "Approve changes / improvements to the operational process, such as (significant) changes to the process definition.",
    "Decide on the provision of resources dedicated to the process and its activities.",
    "Based on process monitoring and reviews, decide on necessary changes in the process-specific goals, policies and provided resources."
  ],
  manager: [
    "Act as the primary contact point for operational concerns in the context of the process.",
    "Maintain the process definition / description and ensure it is available to relevant persons.",
    "Maintain an adequate level of awareness and competence of the people involved in the process.",
    "Monitor and keep track of the process execution and results (incl. process reviews).",
    "Manage risks that involve this process (unless there is a process-specific role that manages risks in this context).",
    "Report on process performance to the process owner.",
    "Escalate to the process owner, if necessary.",
    "Identify opportunities for improving the effectiveness and efficiency of the process."
  ],
  caseOwner: [
    "Overall responsibility for one specific case occurring in a process context (e.g. one specific incident to be resolved).",
    "Act as the primary contact point for all concerns in the context of that specific case.",
    "Coordinate all activities required to handle / resolve the specific case.",
    "Escalate exceptions to the process manager, where required."
  ],
  staff: [
    "Carry out tasks according to the defined / established process and, as applicable, its activities and procedures (e.g. the procedure of prioritizing an incident).",
    "Report to case owners and / or process managers, as appropriate.",
    "Contribute to the effectiveness and continual improvement of the process."
  ]
};

/* Builds the FitSM-3 role set for one process */
function roles(code, managerTasks, caseOwners, extra) {
  const list = [
    { name: `Process owner ${code}`, type: "owner", count: "1 in total", specific: [] },
    { name: `Process manager ${code}`, type: "manager", count: "1 in total", specific: managerTasks }
  ];
  (caseOwners || []).forEach(c => list.push({ name: `Case owner: ${c.name}`, type: "caseOwner", count: c.count, specific: c.tasks, noGeneric: c.noGeneric }));
  (extra || []).forEach(r => list.push(r));
  list.push({ name: `Process staff member (${code})`, type: "staff", count: "As needed", specific: [] });
  return list;
}

const PROCESSES = [
  /* ───────────── PR1 SPM ───────────── */
  {
    id: "SPM", num: "PR1", name: "Service Portfolio Management", group: "agree",
    pos: { x: 370, y: 90 },
    objective: "To maintain the service portfolio and to manage services through their lifecycle",
    questions: [
      "What does the service provider do for its customers, and how can this be structured into services?",
      "How can the service provider use their capabilities to meet future customer needs?",
      "How is the design and implementation of new or changed services planned?",
      "Who does the service provider rely on when providing services?"
    ],
    requirements: [
      ["PR1.1", "A service portfolio shall be maintained. All services shall be specified as part of the service portfolio."],
      ["PR1.2", "Proposals for new or changed services shall be evaluated based on predicted demand, required resources and expected benefits."],
      ["PR1.3", "The evolution of services through their lifecycle shall be managed. This shall include the planning of new services and major alterations to existing services. Plans shall consider timescales, responsibilities, new or changed technology, communication and service acceptance criteria."],
      ["PR1.4", "For each service, the internal and external suppliers involved in delivering the service shall be identified, including, as relevant, federation members. Their contact points, roles and responsibilities shall be determined."]
    ],
    setup: [
      "Define a way to document the service portfolio.",
      "Define a way to describe / specify a specific service (e.g. service specification template) including the lifecycle phases the service may move through (e.g. proposed, planned, production, retired).",
      "Set up an initial service portfolio (including service specifications) covering at least all live services provided to customers, as far as they are in the scope of the SMS.",
      "Create a map of the bodies / parties (organisations, federation members) involved in delivering services — describe the role of each party and identify a single contact point for each.",
      "Define a way to deal with changed demand and new service proposals — create a service proposal template and write down the assessment criteria for proposals."
    ],
    inputs: [
      "Any information indicating demand for services, including (potential) customer demand and requirements",
      "Understanding of the service provider’s resources, capabilities, limitations and constraints",
      "Information on any existing services (e.g. the current service portfolio)"
    ],
    outputs: [
      "Complete and up-to-date service portfolio",
      "Valid and consistent service specifications",
      "Plans for new or changed services (and related requests for changes)"
    ],
    activities: [
      { name: "Manage demand and service proposals", procedures: ["Identify demand for new or changed services", "Create service proposal", "Evaluate service proposal"] },
      { name: "Maintain the service portfolio", procedures: ["Add a new service to the service portfolio", "Update service in the service portfolio", "Retire service from the service portfolio"] },
      { name: "Manage services through their lifecycle", procedures: ["Design and plan a new or changed service", "Oversee the implementation (of the plan for a new or changed service)"] }
    ],
    databases: [
      { name: "Service portfolio", src: "FitSM-0 §6.69 · FitSM-1 PR1.1",
        desc: "Internal list that details all the services offered by a service provider, including those in preparation, live and discontinued. For each service it may include its value proposition, target customer base, service description, relevant technical specifications, cost and price, risks to the service provider and service level packages offered.",
        usedBy: ["SLM"] },
      { name: "Service specifications", src: "FitSM-2 PR1 · FitSM-1 PR1.1",
        desc: "One specification per service, following a service specification template, stored as part of the service portfolio. It records the lifecycle phase of the service (e.g. proposed, planned, production, retired) and the internal and external suppliers involved in delivering it, with their contact points, roles and responsibilities (PR1.4).",
        usedBy: ["SLM", "SUPPM"] },
      { name: "Service proposals & service design and transition plans", src: "FitSM-0 §6.65 note 2 · FitSM-2 PR1",
        desc: "Service proposals (a smaller subset of the specification template) evaluated against documented assessment criteria, and — for approved new or majorly altered services — the service design and transition package (SDTP): requirements and service acceptance criteria, project plan, communication and training plans, technical plans, resource plans and deployment schedules.",
        usedBy: ["CHM", "SUPPM"] },
      { name: "Map of service delivery parties", src: "FitSM-2 PR1 initial setup",
        desc: "A map of the bodies / parties (organisations, federation members) involved in delivering services, describing the role of each party in service provisioning and a single contact point for each.",
        usedBy: ["SUPPM"] }
    ],
    roles: roles("SPM",
      ["Maintain the service portfolio.", "Manage updates to the service portfolio.", "Ensure the lifecycle of new or changed services are managed and appropriate plans are created and maintained.", "Review the service portfolio at planned intervals."],
      [{ name: "Service owner", count: "1 per service", noGeneric: true, tasks: [
        "Overall responsibility for one specific service that is part of the service portfolio.",
        "Act as the primary contact point for all (process-independent) concerns in the context of that specific service.",
        "Act as an “expert” for the service in both technical and non-technical concerns.",
        "Maintain the core service documentation, such as the service specification / description.",
        "Be kept informed of every event, situation or change connected to the service.",
        "Be involved in tasks significantly related to the service as part of selected ITSM processes, in particular SPM and SLM.",
        "Report on the service to the SMS owner."] }])
  },

  /* ───────────── PR2 SLM ───────────── */
  {
    id: "SLM", num: "PR2", name: "Service Level Management", group: "agree",
    pos: { x: 370, y: 300 },
    objective: "To maintain service catalogues, and to define and evaluate agreements on service quality with customers and suppliers",
    questions: [
      "How are relevant parts of the service portfolio presented to customers?",
      "Which service targets are required by customers? What are the resulting SLAs?",
      "Which operational targets need to be fulfilled by suppliers to support the service targets agreed with customers? What are the resulting OLAs and UAs?",
      "How is the fulfilment of SLAs, OLAs and UAs evaluated? How are customers informed of SLA violations?"
    ],
    requirements: [
      ["PR2.1", "A service catalogue shall be maintained."],
      ["PR2.2", "For all services delivered to customers, service level agreements (SLAs) shall be in place and reviewed at planned intervals."],
      ["PR2.3", "Service performance shall be evaluated against service targets defined in SLAs."],
      ["PR2.4", "For supporting services or service components, underpinning agreements (UAs) and operational level agreements (OLAs) shall be agreed as needed and reviewed at planned intervals."],
      ["PR2.5", "Performance of supporting services and service components shall be evaluated against targets defined in UAs and OLAs."]
    ],
    setup: [
      "Define the minimum structure, format and content for service catalogues.",
      "Create an initial service catalogue based on the information in the service portfolio.",
      "Define a basic / default SLA valid for all services provided to customers, where no specific / individual SLAs are in place.",
      "Define templates for individual SLAs, OLAs and UAs.",
      "Identify the most critical supporting service components and agree OLAs and UAs with internal and external suppliers.",
      "Agree individual SLAs with customers for the most important / critical services.",
      "Define a standard way to notify customers of SLA violations."
    ],
    inputs: ["Service portfolio together with service specifications", "General and specific service level requirements"],
    outputs: ["Up-to-date service catalogue covering all information that are relevant for customers", "Default SLA and individual SLAs with customers", "Supporting OLAs and UAs, aligned with SLAs"],
    activities: [
      { name: "Maintain service catalogues", procedures: ["Create a new service catalogue", "Add, update or remove services from a catalogue", "Retire a service catalogue"] },
      { name: "Maintain SLAs", procedures: ["Define and negotiate / agree a new SLA", "Evaluate SLA fulfilment", "Notify customer of an SLA violation", "Review, update or terminate an SLA"] },
      { name: "Maintain supporting agreements (OLAs and UAs)", procedures: ["Define and negotiate / agree a new OLA / UA", "Evaluate OLA / UA fulfilment", "Escalate an OLA / UA violation to the supplier", "Review, update or terminate an OLA / UA"] }
    ],
    databases: [
      { name: "Service catalogue(s)", src: "FitSM-0 §6.62 · FitSM-1 PR2.1",
        desc: "Customer-facing list of all live services offered along with relevant information about these services. A service catalogue can be regarded as a filtered version of — and the customers’ view on — the service portfolio. Based on one service portfolio, one or more service catalogues can be created.",
        usedBy: ["CRM"] },
      { name: "Agreements register (SLAs, OLAs, UAs)", src: "FitSM-0 §6.45, §6.64, §6.76 · FitSM-1 PR2.2–PR2.5",
        desc: "The documented default SLA and individual SLAs (agreements between a customer and the service provider specifying the service and its service targets), OLAs (with internal suppliers / federation members) and UAs (with external suppliers), each with its operational or service targets, owner and review dates. Agreements follow the templates defined in initial setup and are kept aligned with each other.",
        usedBy: ["SRM", "SACM", "CAPM", "ISM", "CRM", "SUPPM", "ISRM"] },
      { name: "Agreement evaluation data", src: "FitSM-2 PR2 · FitSM-1 PR2.3, PR2.5",
        desc: "Results of evaluating service performance against SLA service targets and supporting-service performance against OLA / UA operational targets, including recorded violations and customer notifications. It is the data basis for service reports and supplier evaluation.",
        usedBy: ["SRM", "SUPPM"] }
    ],
    roles: roles("SLM",
      ["Maintain the service catalogue.", "Manage updates to the service catalogue.", "Ensure the service catalogue is aligned with the service portfolio.", "Negotiate SLAs with customers.", "Propose and negotiate OLAs with internal groups or federation members.", "Propose and negotiate UAs with external suppliers.", "Ensure that all SLAs, OLAs and UAs are documented in a consistent manner e.g. through maintaining agreement templates.", "Approve new or changed SLAs, OLAs and UAs.", "Ensure SLAs, OLAs and UAs are aligned to each other."],
      [{ name: "SLA / OLA / UA owner", count: "1 per SLA, OLA and UA", tasks: [
        "Maintain the SLA, OLA or UA under their ownership and ensure it is specified and documented according to relevant specifications.",
        "Evaluate the fulfilment of the SLA, OLA or UA.",
        "Ensure that violations of the targets defined in the SLA, OLA or UA are identified and investigated to prevent future recurrence.",
        "Perform regular reviews of the SLA, OLA or UA.",
        "Understand new or changed requirements on the SLA, OLA or UA under their ownership, and initiate necessary updates or other follow-up actions."] }])
  },

  /* ───────────── PR3 SRM ───────────── */
  {
    id: "SRM", num: "PR3", name: "Service Reporting Management", group: "agree",
    pos: { x: 650, y: 90 },
    objective: "To specify reports on services and processes and ensure they are produced and delivered",
    questions: [
      "Which reports are required by customers and other interested parties?",
      "Which reports are required by internal stakeholders in order to effectively manage the SMS?",
      "What is the required frequency and content of these reports?",
      "Are reports actually produced and distributed as required and agreed?"
    ],
    requirements: [
      ["PR3.1", "Required reports shall be identified. Reporting shall cover performance of services and processes against defined targets, significant events and detected nonconformities."],
      ["PR3.2", "Reports shall be agreed with their recipients and specified. The specification of each report shall include its identity, purpose, audience, frequency, content, format and method of delivery."],
      ["PR3.3", "Reports shall be produced and delivered to their recipients according to specifications."]
    ],
    setup: [
      "Create a list of all reports that are currently produced or will be produced on a regular basis.",
      "Specify every identified report: unique name (ID), purpose, audience / addressee, frequency, intended contents, format and method of delivery.",
      "Define templates for reports to standardise / harmonise the report structure and support effective and repeatable reporting."
    ],
    inputs: ["Reporting requirements (e.g. from SLAs)"],
    outputs: ["List of all (agreed) reports", "Specification of all reports", "Reports"],
    activities: [
      { name: "Identify reporting requirements", procedures: ["Derive targets, events and nonconformities to be reported to customers based on SLAs", "Identify targets, events and nonconformities to be reported to internal stakeholders to support management of the SMS"] },
      { name: "Maintain report specifications", procedures: ["Define / specify a new report", "Update a report specification", "Terminate a report"] },
      { name: "Monitor the production and distribution of reports", procedures: ["Verify the production and distribution of reports according to specifications", "Initiate follow-up actions in case of inaccurate reporting"] }
    ],
    databases: [
      { name: "Report list & report specifications", src: "FitSM-1 PR3.2 · FitSM-2 PR3",
        desc: "The list of all agreed reports, and for each one its specification: identity (unique name / ID), purpose, audience, frequency, content, format and method of delivery, based on standard report templates.",
        usedBy: [] },
      { name: "Produced reports", src: "FitSM-0 §6.56",
        desc: "Reports are structured records communicating results gathered through measurement, monitoring, assessment, audit or observation — e.g. a service report detailing the performance of a service versus the service targets defined in an SLA. Recipients may be customers, suppliers, federation members, service owners and the SMS owner.",
        usedBy: ["CRM", "CSI"] }
    ],
    roles: roles("SRM",
      ["Maintain the list of reports.", "Review report specifications in regular intervals.", "Monitor the production of accurate reports according to specifications."],
      [{ name: "Report owner", count: "1 per report", tasks: [
        "Maintain the report specification for the report under their ownership.",
        "Produce and deliver the report according to the specification.",
        "Ensure that the input / contributions required to produce the report is provided in time.",
        "Understand new or changed requirements on the report under their ownership and update the report specification accordingly."] }])
  },

  /* ───────────── PR4 SACM ───────────── */
  {
    id: "SACM", num: "PR4", name: "Service Availability & Continuity Management", group: "quality",
    pos: { x: 650, y: 215 },
    objective: "To ensure sufficient service availability and continuity to meet service targets",
    questions: [
      "How are the requirements for service availability and continuity determined?",
      "How are the measures planned that have to be taken to meet the requirements?",
      "How is service availability monitored?"
    ],
    requirements: [
      ["PR4.1", "Service availability and continuity requirements shall be identified and reviewed at planned intervals, taking into consideration SLAs."],
      ["PR4.2", "Service availability and continuity risks shall be assessed at planned intervals."],
      ["PR4.3", "Appropriate measures shall be taken to reduce the probability and impact of identified availability and continuity risks and meet identified requirements."],
      ["PR4.4", "Availability of services and service components shall be monitored."]
    ],
    setup: [
      "Identify the most critical service availability and continuity requirements based on SLAs and other sources of information.",
      "Define the structure and format of a (generic) service availability and continuity plan.",
      "Define an approach to monitor service availability (and continuity) and to record the results on an ongoing basis."
    ],
    inputs: ["Service availability and continuity requirements (e.g. from SLAs)", "Risk factors having impact on the capability of delivering services according to agreed availability and continuity targets"],
    outputs: ["Service availability and continuity plans", "Service availability data", "Requests for change"],
    activities: [
      { name: "Identify service availability and continuity requirements", procedures: ["Derive availability targets from SLAs", "Identify continuity requirements based on SLAs and business impact analysis"] },
      { name: "Maintain and implement service availability and continuity plans", procedures: ["Assess risks related to service availability and continuity", "Create service continuity and availability plans", "Implement preventive measures from plans", "Review, update or terminate service continuity and availability plans"] },
      { name: "Evaluate service availability and continuity", procedures: ["Monitor service availability", "Perform service continuity tests for reactive measures from plans"] }
    ],
    databases: [
      { name: "Availability & continuity plans", src: "FitSM-2 PR4 · FitSM-1 PR4.2–PR4.3",
        desc: "Plans following the generic plan structure defined in initial setup. They capture availability and continuity requirements (from SLAs and business impact analysis), assessed availability and continuity risks, and the preventive and reactive measures to reduce their probability and impact — including the continuity tests to be performed.",
        usedBy: ["CHM"] },
      { name: "Service availability data", src: "FitSM-2 PR4 · FitSM-1 PR4.4",
        desc: "Ongoing records of monitored availability of services and service components, and results of continuity tests. Availability is the ability of a service or service component to fulfil its intended function at a specific time or over a specific period of time (FitSM-0 §6.4).",
        usedBy: ["SRM"] }
    ],
    roles: roles("SACM",
      ["Identify service availability and continuity requirements.", "Ensure that the input / contributions required to produce service availability and continuity plans are provided by relevant parties.", "Produce, maintain and review all service availability and continuity plans regularly.", "Ensure that measures to increase service availability and continuity (according to plans) are planned and implemented under the control of the change management process.", "Act as a contact point in case of questions regarding service availability and continuity requirements and measures."],
      [{ name: "Availability plan owner / continuity plan owner", count: "1 per availability plan / continuity plan", tasks: [
        "Create and maintain the availability or continuity plan under their ownership.",
        "Ensure that relevant stakeholders in the context of the plan are consulted and informed when creating, updating or implementing the plan.",
        "Ensure the plan and any updates to it are approved by relevant authorities.",
        "Based on the contents of the final / approved plan, raise requests for changes or trigger the continual service improvement process, as required.",
        "In case of a continuity plan: ensure that the needs for testing the plan are identified and tests of preventive or reactive measures are performed regularly."] }])
  },

  /* ───────────── PR5 CAPM ───────────── */
  {
    id: "CAPM", num: "PR5", name: "Capacity Management", group: "quality",
    pos: { x: 650, y: 320 },
    objective: "To ensure sufficient capacity and service performance to meet service targets",
    questions: [
      "How are the requirements for service performance and capacity determined?",
      "How are the measures planned that have to be taken to meet the requirements?",
      "How is service performance and utilisation monitored?"
    ],
    requirements: [
      ["PR5.1", "Service capacity and performance requirements shall be identified and reviewed at planned intervals, taking into consideration SLAs and predicted demand."],
      ["PR5.2", "Current capacity and utilisation shall be identified."],
      ["PR5.3", "Future capacity shall be planned to meet identified requirements, considering human, technical and financial resources."],
      ["PR5.4", "Performance of services and service components shall be analysed based on monitoring the degree of capacity utilisation and identifying operational warnings and exceptions."]
    ],
    setup: [
      "Define the structure and format of a (generic) capacity plan.",
      "Define an approach to monitor service performance and capacity (including utilisation of resources) and to record the results on an ongoing basis."
    ],
    inputs: ["Service performance and capacity requirements (e.g. from SLAs)", "Current level of capacities plus information on the past, current and future (predicted) utilisation of resources", "Information on available resources and constraints"],
    outputs: ["Capacity plans (reflecting demands, planned upgrades, downgrades and reallocations of resources)", "Capacity and service performance monitoring plans / concept", "Capacity and service performance monitoring records / reports"],
    activities: [
      { name: "Identify service capacity and performance requirements", procedures: ["Derive performance targets from SLAs", "Translate performance targets into capacity requirements"] },
      { name: "Maintain and implement capacity plans", procedures: ["Create capacity plans", "Ensure capacity according to plans", "Review, update or terminate capacity plans"] },
      { name: "Evaluate service performance", procedures: ["Monitor performance of services and service components", "Monitor capacity including assessment against thresholds", "Respond when capacity thresholds are exceeded"] }
    ],
    databases: [
      { name: "Capacity plans", src: "FitSM-2 PR5 · FitSM-1 PR5.3",
        desc: "Plans reflecting demands, planned upgrades, downgrades and reallocations of resources, considering human, technical and financial resources. Capacity is the maximum extent to which a certain element of the infrastructure (such as a CI) can be used — e.g. total disk capacity, network bandwidth or maximum transaction throughput (FitSM-0 §6.7).",
        usedBy: ["CHM"] },
      { name: "Capacity & performance monitoring records", src: "FitSM-2 PR5 · FitSM-1 PR5.2, PR5.4",
        desc: "Records of current capacity and utilisation, performance of services and service components, thresholds and threshold violations (operational warnings and exceptions), collected according to the monitoring concept defined in initial setup.",
        usedBy: ["SRM"] }
    ],
    roles: roles("CAPM",
      ["Identify service performance and capacity requirements.", "Ensure that the input / contributions required to produce capacity plans are provided by relevant parties.", "Produce, maintain and review capacity plans regularly.", "Ensure that measures to increase service performance and capacity (according to plans) are planned and implemented under the control of the change management process.", "Act as a contact point in case of questions regarding service performance and capacity requirements and measures."],
      [{ name: "Capacity plan owner", count: "1 per capacity plan", tasks: [
        "Create and maintain the capacity plan under their ownership.",
        "Ensure that relevant stakeholders in the context of the plan are consulted and informed when creating, updating or implementing the plan.",
        "Ensure the plan and any updates to it are approved by relevant authorities.",
        "Based on the contents of the final / approved plan, raise requests for changes or trigger the CSI process, as required."] }])
  },

  /* ───────────── PR6 ISM ───────────── */
  {
    id: "ISM", num: "PR6", name: "Information Security Management", group: "quality",
    pos: { x: 650, y: 425 },
    objective: "To preserve confidentiality, integrity and availability of information related to managing and delivering services",
    questions: [
      "How are information security requirements determined?",
      "How are information security controls and policies established, based on an understanding of relevant risks?",
      "How are information security events monitored and information security incidents handled?",
      "How are access rights managed?"
    ],
    requirements: [
      ["PR6.1", "Information security requirements shall be identified and information security policies defined and reviewed at planned intervals."],
      ["PR6.2", "Information security risks shall be assessed at planned intervals."],
      ["PR6.3", "Physical, technical and organisational information security controls shall be implemented to reduce the probability and impact of identified information security risks and meet identified requirements."],
      ["PR6.4", "Information security events and incidents shall be handled in a consistent manner."],
      ["PR6.5", "Access control, including provisioning of access rights, shall be carried out in a consistent manner."]
    ],
    setup: [
      "Define a scheme to classify information assets according to their sensitivity / criticality.",
      "Define a way to document an inventory of (information) assets.",
      "Identify, describe and classify the most important information assets.",
      "Identify the most important links between service components (information-processing systems / facilities) and the information assets.",
      "Define a method / scheme to identify and assess information security risks.",
      "Perform an initial risk assessment focused on the most significant information security risks.",
      "Define clear information security policies as a basis for effective information security governance.",
      "Define a way to document information security controls and to monitor their status and progress of implementation.",
      "Identify and document the most important technical, physical and organisational information security controls in place."
    ],
    inputs: ["Information security requirements (from SLAs, legislation, contracts)", "Assets to be protected", "Relevant risk factors (vulnerabilities, hazards)"],
    outputs: ["Up-to-date inventory of information assets", "Approved information security policies", "Up-to-date information security risk assessment", "Documented information security controls", "Reports on information security events, incidents and follow-up actions", "Documented information on access rights and their reviews"],
    activities: [
      { name: "Identify information security requirements", procedures: ["Derive information security requirements from SLAs", "Identify information (assets) to be protected and their needs in terms of confidentiality, integrity and availability"] },
      { name: "Maintain and implement information security controls and policies", procedures: ["Assess risks related to information security", "Create information security policies and define other controls", "Implement information security controls", "Review, update or terminate information security policies and other controls"] },
      { name: "Evaluate information security", procedures: ["Monitor, record and classify information security events", "Identify and handle information security incidents"] },
      { name: "Perform access control", procedures: ["Process requests for access rights", "Provide access rights", "Modify or revoke access rights", "Review access rights (at regular intervals)"] }
    ],
    databases: [
      { name: "Information asset inventory", src: "FitSM-2 PR6",
        desc: "Inventory of information assets, each classified by sensitivity / criticality according to the classification scheme, with their needs in terms of confidentiality, integrity and availability and their links to the service components (information-processing systems / facilities) that handle them.",
        usedBy: [] },
      { name: "Information security risk assessment (risk register)", src: "FitSM-1 PR6.2 · FitSM-0 §6.58",
        desc: "Up-to-date assessment of information security risks based on the identified assets and the defined risk method. A risk combines the probability of a threat, the vulnerability of an asset to it and its impact. Each risk has a security risk owner.",
        usedBy: [] },
      { name: "Security policies & controls register", src: "FitSM-1 PR6.1, PR6.3 · FitSM-0 §6.31",
        desc: "Approved information security policies and documented physical, technical and organisational information security controls (means of controlling or treating one or more risks), with their implementation status and progress. Each control has a security control owner.",
        usedBy: ["CHM"] },
      { name: "Security event & incident records", src: "FitSM-1 PR6.4 · FitSM-0 §6.32–6.33",
        desc: "Records of monitored and classified information security events (occurrences indicating a possible breach of information security) and information security incidents (events with significant probability of negative impact on service delivery), with handling and follow-up actions.",
        usedBy: [] },
      { name: "Access rights records", src: "FitSM-1 PR6.5 · FitSM-2 PR6",
        desc: "Documented information on requested, provided, modified and revoked access rights, and the results of their periodic reviews.",
        usedBy: [] }
    ],
    roles: roles("ISM",
      ["Act as the primary contact of the service provider for all information security-related issues.", "Monitor the status and progress of all activities connected to the process of information security management, in particular, the assessment and treatment of information security risks and handling of information security events and incidents.", "Ensure that information security incidents are detected and classified as such and as quickly as possible handled in an effective way to minimise harm caused by them.", "Ensure that all security-related documentation is maintained and up to date.", "Ensure that security risks and controls are assigned to case owners."],
      [
        { name: "Security risk owner", count: "1 per security risk", tasks: ["Maintain and review the specification / documentation of a specific security risk.", "Act as a primary contact point and expert for the risk under their ownership."] },
        { name: "Security control owner", count: "1 per security control", tasks: ["Maintain and review the specification / documentation of a specific security control.", "Act as a primary contact point and expert for the control under their ownership."] }
      ]).map(r => r.type === "manager" ? { ...r, name: "Process manager ISM (Information security manager / officer)" } : r)
  },

  /* ───────────── PR7 CRM ───────────── */
  {
    id: "CRM", num: "PR7", name: "Customer Relationship Management", group: "rel",
    pos: { x: 110, y: 170 },
    objective: "To establish and maintain good relationships with customers receiving services",
    questions: [
      "Who are the customers and users of the IT services?",
      "How are the relationships with customers managed, and what are the best ways to get or stay in touch with your customers?",
      "Are the services matching customer needs and leading to customer satisfaction?",
      "How are customer complaints handled?"
    ],
    requirements: [
      ["PR7.1", "Service customers shall be identified."],
      ["PR7.2", "For each customer, there shall be a designated contact responsible for managing the relationship with them."],
      ["PR7.3", "Channels used to communicate with each customer, including mechanisms for service ordering, escalation and complaint shall be established."],
      ["PR7.4", "Service reviews with customers shall be conducted at planned intervals."],
      ["PR7.5", "Service complaints from customers shall be handled in a consistent manner."],
      ["PR7.6", "Customer satisfaction shall be managed."]
    ],
    setup: [
      "Set up an initial customer database, and for each service customer document the most important information including contact information.",
      "Decide on general communication channels to be used for customer engagement (e.g. ordering, escalation and complaints).",
      "Define a way to perform and document the results of a service review.",
      "Define a way to record, respond to and follow-up a customer complaint.",
      "Define a way to evaluate customer satisfaction on a regular basis, e.g. (online) surveys."
    ],
    inputs: ["Information on service customers", "Current service catalogue", "Customer demands and requirements", "Existing SLAs with customers", "Customer complaints"],
    outputs: ["Up-to-date database of service customers (customer database)", "Service review reports", "Customer complaints records", "Customer satisfaction reports"],
    activities: [
      { name: "Maintain the customer database", procedures: ["Add a new customer to the customer database (including contact information)", "Update the information on a customer in the customer database", "Remove a customer from the customer database"] },
      { name: "Perform customer service reviews", procedures: ["Plan and prepare service reviews with customers", "Perform and record a service review with a customer"] },
      { name: "Handle customer complaints", procedures: ["Register, address and close a customer complaint", "Track the implementation status of actions following a customer complaint", "Review all customer complaints and follow-up actions periodically"] },
      { name: "Manage customer satisfaction", procedures: ["Plan and implement measures to assess customer satisfaction", "Initiate follow-up actions in response to insufficient customer satisfaction"] }
    ],
    databases: [
      { name: "Customer database", src: "FitSM-2 PR7 · FitSM-1 PR7.1–PR7.3 · FitSM-0 §6.18",
        desc: "Up-to-date database of service customers — organisations or parts of organisations that commission the service provider to receive one or more services. For each customer it records the most important information, including contact information, the designated customer relationship manager and the agreed communication channels (ordering, escalation, complaints).",
        usedBy: ["SLM"] },
      { name: "Service review records", src: "FitSM-0 §6.72 · FitSM-1 PR7.4",
        desc: "Documented results of service reviews: periodic evaluations of the quality and performance of a service together with the customer, from which opportunities for improvement and follow-up actions are identified.",
        usedBy: ["SLM", "CSI"] },
      { name: "Customer complaint records", src: "FitSM-1 PR7.5 · FitSM-2 PR7",
        desc: "Registered customer complaints with their handling, closure and the implementation status of follow-up actions, reviewed periodically.",
        usedBy: ["CSI", "CHM"] },
      { name: "Customer satisfaction results", src: "FitSM-1 PR7.6 · FitSM-2 PR7",
        desc: "Customer satisfaction reports from regular evaluations (e.g. online surveys), and the follow-up actions initiated in response to insufficient satisfaction.",
        usedBy: ["CSI"] }
    ],
    roles: roles("CRM",
      ["Maintain the customer database.", "Ensure that customer complaints are handled according to the process.", "Coordinate customer satisfaction surveys.", "Review the results from customer service reviews."],
      [{ name: "Customer relationship manager (Account manager)", count: "1 per identified customer", tasks: [
        "Act as the primary contact point for a specific customer.",
        "Maintain the relationship with that customer by regular communication.",
        "Process formal customer complaints.",
        "Conduct, moderate and record customer service reviews."] }])
  },

  /* ───────────── PR8 SUPPM ───────────── */
  {
    id: "SUPPM", num: "PR8", name: "Supplier Relationship Management", group: "rel",
    pos: { x: 110, y: 420 },
    objective: "To establish and maintain healthy relationships with internal and external suppliers and to monitor their performance",
    questions: [
      "Who are the suppliers supporting the delivery of IT services?",
      "How are the relationships with suppliers managed?",
      "What are the best ways to get or stay in touch with your suppliers?",
      "Are the suppliers performing as agreed and required?"
    ],
    requirements: [
      ["PR8.1", "Internal and external suppliers shall be identified."],
      ["PR8.2", "For each supplier, there shall be a designated contact responsible for managing the relationship with them."],
      ["PR8.3", "Channels used to communicate with each supplier, including escalation mechanisms, shall be established."],
      ["PR8.4", "Suppliers shall be evaluated at planned intervals."]
    ],
    setup: [
      "Set up an initial supplier database (covering all internal and external suppliers).",
      "For each supplier, document the most important information including contact details both on the supplier side and on the service provider side (supplier relationship manager).",
      "Understand which supplier services or service components need to be monitored, and how the monitoring will take place."
    ],
    inputs: ["Information on suppliers", "Information on supplier offerings", "OLAs with internal suppliers", "UAs with external suppliers"],
    outputs: ["Up-to-date supplier database", "Supplier evaluation results"],
    activities: [
      { name: "Maintain the supplier database", procedures: ["Add a new supplier to the supplier database (including contact information)", "Update the information on a supplier in the supplier database", "Remove a supplier from the supplier database"] },
      { name: "Monitor supplier performance", procedures: ["Evaluate supplier performance", "Together with the supplier, agree on follow-up actions in response to insufficient supplier performance", "Track the implementation status of agreed follow-up actions with suppliers"] }
    ],
    databases: [
      { name: "Supplier database", src: "FitSM-2 PR8 · FitSM-1 PR8.1–PR8.3 · FitSM-0 §6.74",
        desc: "Up-to-date database of all internal and external suppliers — parties that provide a (supporting) service or service component the service provider needs to deliver services (in a federation, federation members are internal suppliers). For each supplier: contact details on both sides (incl. the supplier relationship manager), communication and escalation channels, and which supplier services / components are monitored and how.",
        usedBy: ["SPM", "SLM"] },
      { name: "Supplier evaluation records", src: "FitSM-1 PR8.4 · FitSM-2 PR8",
        desc: "Results of periodic supplier performance evaluations (against OLA / UA operational targets), agreed follow-up actions and their implementation status.",
        usedBy: [] }
    ],
    roles: roles("SUPPM",
      ["Maintain the supplier database.", "Ensure that supplier performance is monitored according to the process."],
      [{ name: "Supplier relationship manager", count: "1 per identified supplier", tasks: [
        "Act as the primary contact point for a specific supplier.",
        "Maintain the relationship with that supplier by regular communication.",
        "Maintain mechanisms for monitoring the performance of the supplier."] }])
  },

  /* ───────────── PR9 ISRM ───────────── */
  {
    id: "ISRM", num: "PR9", name: "Incident & Service Request Management", group: "ops",
    pos: { x: 370, y: 640 },
    objective: "To restore agreed service operation after the occurrence of an incident and to respond to user service requests",
    questions: [
      "How are incidents and service requests handled?",
      "What information can be used to support the effective handling and resolution of incidents?",
      "How are customers involved?",
      "How are major incidents distinguished from other incidents and handled accordingly?"
    ],
    requirements: [
      ["PR9.1", "All incidents and service requests shall be registered, classified and prioritised in a consistent manner, taking into account service targets from SLAs."],
      ["PR9.2", "Incidents shall be resolved and service requests fulfilled, taking into consideration information from SLAs and on known errors, as relevant."],
      ["PR9.3", "Functional and hierarchical escalation of incidents and service requests shall be carried out in a consistent manner."],
      ["PR9.4", "Customers and users shall be kept informed of the progress of incidents and service requests, as appropriate."],
      ["PR9.5", "Closure of incidents and service requests shall be carried out in a consistent manner."],
      ["PR9.6", "Major incidents shall be identified based on defined criteria, and handled in a consistent manner."]
    ],
    setup: [
      "Set up a tool (e.g. ticket / workflow tool) supporting recording and handling (classification, prioritisation, escalation, closure) of incidents and service requests.",
      "Define a procedure for recording incidents and service requests (sources and channels, required format, how they are recorded).",
      "Define a procedure for classifying incidents and service requests (classification scheme and how to apply it).",
      "Define a procedure for prioritising incidents and service requests (prioritisation scheme and how priority is calculated).",
      "Define a procedure for escalating incidents and service requests (functional and hierarchical escalation paths).",
      "Define a procedure for closing incidents and service requests (including required user communication and confirmation).",
      "Define the criteria for identifying a major incident, and a procedure for dealing with major incidents from recording to closure, including a major incident review.",
      "Identify well-known and recurring incidents and describe the concrete steps to manage each from recording to closure.",
      "Identify standardised service requests based on service descriptions and SLAs and describe the concrete steps to fulfil each."
    ],
    inputs: ["Incidents reported by users or identified by the service provider", "Service requests raised by users", "Configuration information (CMDB)"],
    outputs: ["Incident records", "Service request records", "Major incident review reports", "Requests for changes raised to trigger the change management process, in order to commence the fulfilment of service requests", "Up-to-date descriptions of step-by-step workflows for standard incidents and service requests", "Regular incident reports"],
    activities: [
      { name: "Manage incidents and service requests", procedures: ["Register incident or service request", "Classify and prioritise incident or service request including checking against major incident criteria", "Escalate incident or service request as required", "Resolve incident or fulfil service request", "Close incident or service request"] },
      { name: "Manage major incidents", procedures: ["Identify incident as major incident based on agreed criteria", "Assign a major incident coordinator for the major incident", "Handle major incident with highest priority", "Inform stakeholders and escalate major incident as required", "Resolve major incident", "Perform major incident review and close the major incident"] },
      { name: "Manage workflows needed to resolve incidents and fulfil service requests", procedures: ["Maintain the step-by-step workflows for well-known and recurring incidents taking into account the KEDB", "Maintain workflows for standardised service requests"] }
    ],
    databases: [
      { name: "Incident & service request records (ticket tool)", src: "FitSM-0 §6.29, §6.53, §6.71 · FitSM-2 PR9",
        desc: "Records of every incident (unplanned disruption or degradation of service quality versus agreed service levels) and service request (user request for information, advice, access to a service or a change), held in the ticket / workflow tool with classification, priority, escalation history, resolution and closure status.",
        usedBy: ["PM"] },
      { name: "Standard workflow library", src: "FitSM-2 PR9",
        desc: "Up-to-date step-by-step workflows for well-known and recurring incidents (maintained taking the KEDB into account) and for standardised service requests, identified from service descriptions and SLAs.",
        usedBy: [] },
      { name: "Major incident review reports", src: "FitSM-2 PR9 · FitSM-0 §6.40",
        desc: "Documented reviews of major incidents — incidents that (may) have significant impact on the customer — performed before the major incident is closed.",
        usedBy: ["PM", "CSI"] }
    ],
    roles: roles("ISRM",
      ["Ensure that all incidents and service requests are recorded, and that records are of sufficient quality to enable traceability and long-term analysis.", "Monitor the overall progress of incident resolution and service request fulfilment and identify potential violations of target response and resolution times."],
      [{ name: "Incident owner / service request owner", count: "1 per incident / service request", tasks: [
        "Coordinate and take over overall responsibility for all activities in the lifecycle of a specific incident or service request.",
        "Monitor the progress of incident resolution or request fulfilment taking into account agreed timeframes.",
        "Trigger reminders to those involved in incident resolution or request fulfilment and escalate to the process manager as required.",
        "In case of a (potential) SLA violation, trigger communication and escalation as defined in the SLM process.",
        "Ensure an adequate level of documentation for the specific incident or service request."] }])
  },

  /* ───────────── PR10 PM ───────────── */
  {
    id: "PM", num: "PR10", name: "Problem Management", group: "ops",
    pos: { x: 650, y: 640 },
    objective: "To identify and investigate problems in order to reduce their impact or prevent them from causing further incidents",
    questions: [
      "How are problems identified?",
      "How are problems investigated and handled in a way that their impact is minimised?",
      "What information on known errors and workarounds need to be maintained?"
    ],
    requirements: [
      ["PR10.1", "Problems shall be identified and registered in a consistent manner, based on analysing patterns and trends in the occurrence of incidents."],
      ["PR10.2", "Problems shall be investigated to identify actions to resolve them or reduce their impact on services."],
      ["PR10.3", "If a problem is not permanently resolved, a known error shall be registered together with actions such as effective workarounds and temporary fixes."],
      ["PR10.4", "Up-to-date information on known errors and effective workarounds shall be maintained."]
    ],
    setup: [
      "Define a standardised and repeatable way to register problems, known errors and related workarounds, and set up an initial known error database (KEDB).",
      "Set up a tool (e.g. ticket / workflow tool) supporting the recording and handling (classification, prioritisation, escalation, closure) of identified problems.",
      "Make sure relevant information on incidents, including incident records and reports, and the CMDB are accessible to problem management staff.",
      "Ensure staff involved in both ISRM and PM are aware of the different goals and perspectives of these processes."
    ],
    inputs: ["Statistics on incidents and service requests (for trend analysis)", "Incident and service request records", "Other relevant sources of information to identify (new) problems, including change and release records", "Configuration information (CMDB)"],
    outputs: ["Up-to-date KEDB with information (records) on problems, known errors and related workarounds", "Requests for changes raised to trigger the change management process, in order to resolve the underlying root cause(s) of identified problems / known errors"],
    activities: [
      { name: "Identify problems", procedures: ["Perform regular incident pattern and trend analysis to identify (potential) problems", "Register a problem"] },
      { name: "Handle problems", procedures: ["Classify and prioritise a problem", "Identify the root cause and categorise the problem as a known error", "Identify one or more workarounds where possible", "Assess options for resolution of a problem, and resolve a problem where appropriate", "Close a problem (following resolution or when no longer relevant)"] },
      { name: "Maintain the KEDB", procedures: ["Add a known error (including one or more workarounds) to the KEDB", "Update or deactivate a known error record in the KEDB"] }
    ],
    databases: [
      { name: "Known error database (KEDB)", src: "FitSM-2 PR10 · FitSM-0 §6.38, §6.80",
        desc: "Up-to-date store of records on problems, known errors and related workarounds. A known error is a problem which has not (yet) been resolved, but for which there are documented workarounds or measures to reduce or prevent negative impact on services. A workaround circumvents or mitigates the symptoms of a known error (also called a temporary fix).",
        usedBy: ["ISRM"] },
      { name: "Problem records", src: "FitSM-0 §6.50 · FitSM-1 PR10.1",
        desc: "Records of registered problems — underlying causes of one or more incidents that require further investigation — with classification, priority, root cause analysis, resolution options and closure status, held in the problem ticket / workflow tool.",
        usedBy: ["CHM", "CSI"] }
    ],
    roles: roles("PM",
      ["Ensure that incident trends are regularly analysed to identify problems.", "Ensure that identified problems are recorded, and that records are of sufficient quality.", "Ensure that problems are analysed, information on known errors recorded and problems brought to closure."],
      [{ name: "Problem owner", count: "1 per problem", tasks: [
        "Coordinate and take over overall responsibility for all activities in the lifecycle of a specific problem, including problem analysis and identification of options to handle the problem.",
        "Monitor the progress of problem resolution and ensure that the problem is escalated effectively, if required.",
        "Ensure the information in the KEDB on this problem / known error are up to date, including appropriate descriptions of potential workarounds.",
        "Communicate the problem / known error and potential workarounds to relevant stakeholders (e.g. ISRM staff and users).",
        "Depending on the selected option for dealing with the problem / known error, raise requests for changes or trigger the CSI process as required."] }])
  },

  /* ───────────── PR11 CONFM ───────────── */
  {
    id: "CONFM", num: "PR11", name: "Configuration Management", group: "control",
    pos: { x: 950, y: 720 },
    objective: "To provide and maintain a logical model of configuration items in support of other service management activities",
    questions: [
      "For the services offered: What is considered a CI, and what is not?",
      "What information needs to be maintained in the CMDB for each CI?",
      "How to ensure that the information in the CMDB is correct and up-to-date?"
    ],
    requirements: [
      ["PR11.1", "The scope of configuration management shall be defined together with the types of configuration items (CIs) and relationships to be considered."],
      ["PR11.2", "The level of detail of configuration information shall be sufficient to support effective control over CIs."],
      ["PR11.3", "Information on CIs and their relationships with other CIs shall be maintained in a configuration management database (CMDB)."],
      ["PR11.4", "CIs shall be controlled and changes to CIs tracked in the CMDB."],
      ["PR11.5", "The information stored in the CMDB shall be verified at planned intervals."]
    ],
    setup: [
      "Define the scope of the configuration management process and the integrated CMDB.",
      "Agree the level of detail of configuration information to be collected.",
      "Identify and define CI types (including their attributes) and relationship types.",
      "Based on the defined scope, identify all existing sources of configuration information in the environment of the service provider.",
      "Define the concept for integrating available sources of configuration information and add missing configuration information to the integrated CMDB, including selecting supporting tools."
    ],
    inputs: ["Relevant information / data on configuration items (CIs) and their relationships", "Information on changes to CIs"],
    outputs: ["Up-to-date logical model of all relevant CIs and their attributes and relationships, reflected by the records stored in the CMDB", "Configuration verification reports"],
    activities: [
      { name: "Maintain configuration information", procedures: ["Record new CI in the CMDB (create a configuration record)", "Update information on a CI"] },
      { name: "Verify configuration information", procedures: ["Plan configuration verification", "Perform configuration verification (to identify errors or inconsistencies in configuration information and trigger corrective actions)"] }
    ],
    databases: [
      { name: "Configuration management database (CMDB)", src: "FitSM-0 §6.15–6.16 · FitSM-1 PR11.3",
        desc: "Store for data about configuration items (CIs). A CMDB is not necessarily a single database covering all CIs — it may be composed of multiple data stores. Each CI record holds the CI’s attributes and its relationships with other CIs, service components and services. CIs range from technical components (hardware, network components, software) to documents (SLAs, manuals, licence documentation).",
        usedBy: ["ISRM", "PM", "RDM", "CHM", "SPM", "SLM", "SRM", "SACM", "CAPM", "ISM", "CRM", "SUPPM", "CSI"] },
      { name: "CI type & relationship type definitions", src: "FitSM-1 PR11.1 · FitSM-2 PR11",
        desc: "Definition of the scope of configuration management, the CI types (with their attributes) and relationship types to be considered, and the agreed level of detail of configuration information.",
        usedBy: [] },
      { name: "Configuration verification reports", src: "FitSM-1 PR11.5 · FitSM-2 PR11",
        desc: "Results of planned verifications of the information stored in the CMDB, identifying errors or inconsistencies and the corrective actions triggered.",
        usedBy: ["CSI"] }
    ],
    roles: roles("CONFM",
      ["Maintain and periodically review the scope and granularity of the CMDB.", "Maintain the definitions of all CI and relationship types.", "Plan regular verifications of the configuration information held in the CMDB.", "Ensure that configuration verifications are conducted and identified nonconformities addressed."],
      [{ name: "Configuration item (CI) owner", count: "1 per CI", tasks: [
        "Ensure that the information on a specific CI in the CMDB is accurate and up to date.",
        "Collaborate with the process manager and other CI owners to ensure that all information on the relationships from / to a specific CI are accurate and up to date."] }])
  },

  /* ───────────── PR12 CHM ───────────── */
  {
    id: "CHM", num: "PR12", name: "Change Management", group: "control",
    pos: { x: 950, y: 425 },
    objective: "To plan, approve and review changes in a controlled manner to avoid adverse impact on services",
    questions: [
      "What types of changes are considered, and how are changes classified accordingly?",
      "How are different types of changes assessed and approved?",
      "How do we know if a change was successful?",
      "How are changes planned and coordinated with deployment?",
      "How to ensure that information on planned changes are available to relevant parties?"
    ],
    requirements: [
      ["PR12.1", "All changes shall be registered and classified in a consistent manner. Classification shall be based on defined criteria and consider different types of changes, including emergency changes and major changes."],
      ["PR12.2", "For each type of change, steps shall be defined for handling them in a consistent manner."],
      ["PR12.3", "Changes shall be assessed in a consistent manner, taking into consideration benefits, risks, potential impact, effort and technical feasibility."],
      ["PR12.4", "Changes shall be approved in a consistent manner. The required level of approval shall be determined based on defined criteria."],
      ["PR12.5", "Changes shall be subject to a post implementation review as needed, and closed in a consistent manner."],
      ["PR12.6", "A schedule of changes shall be maintained. It shall contain details of approved changes and intended deployment dates, which shall be communicated to interested parties."]
    ],
    setup: [
      "Set up a tool (e.g. ticket / workflow tool) supporting the recording and handling (classification, evaluation, approval, implementation, post implementation review) of changes.",
      "Define a standardised way of recording requests for changes (RFCs) and resulting approved changes (sources and channels, required format, recording).",
      "Define the criteria for identifying emergency changes, and a standardised way of dealing with them from recording to closure, including an emergency change review.",
      "Identify well-known and recurring changes, create a standardised change for each and describe the concrete steps to manage it from recording to closure.",
      "Create a schedule of changes (including those in releases to provide an overview of change implementation)."
    ],
    inputs: ["Requests for changes (RFCs)", "Information on planned releases and deployments"],
    outputs: ["Change records", "Up-to-date schedule of changes", "Post implementation review reports", "Up-to-date list of (pre-defined) standard changes and step-by-step workflows for handling them"],
    activities: [
      { name: "Manage change evaluation and approval", procedures: ["Register a change based on a request for change (RFC)", "Classify a change, including checking against major change and emergency change criteria", "Assess a change", "Approve or reject a change (considering special conditions for major or emergency changes)"] },
      { name: "Manage change implementation and review (in connection with RDM where applicable)", procedures: ["Plan and schedule a change (including technical and non-technical actions)", "Implement a change", "Perform a post implementation review (considering special conditions for major or emergency changes)", "Close a change"] }
    ],
    databases: [
      { name: "Change records (RFCs)", src: "FitSM-0 §6.8, §6.57 · FitSM-1 PR12.1",
        desc: "Records of every request for change (a documented proposal for a change) and the resulting change — an alteration (addition, removal, modification, replacement) of a CI or another entity requiring change control — with classification (incl. major / emergency), assessment, approval, implementation, PIR and closure.",
        usedBy: ["CONFM", "PM"] },
      { name: "Schedule of changes", src: "FitSM-1 PR12.6",
        desc: "Up-to-date schedule containing details of approved changes and their intended deployment dates, communicated to interested parties. It is the basis for planning and scheduling releases.",
        usedBy: ["RDM"] },
      { name: "Standard changes catalogue", src: "FitSM-2 PR12 · FitSM-1 PR12.2",
        desc: "Up-to-date list of pre-defined standard changes (well-known, recurring changes that can be considered pre-approved) with step-by-step workflows for handling them.",
        usedBy: [] },
      { name: "Post implementation review reports", src: "FitSM-0 §6.48 · FitSM-1 PR12.5",
        desc: "Reviews performed after a change is implemented to determine whether it was successful; depth varies with the type and complexity of the change.",
        usedBy: ["CSI"] }
    ],
    roles: roles("CHM",
      ["Plan, schedule, prepare and moderate change advisory board (CAB) meetings.", "Maintain the list and descriptions of standard changes, together with relevant technical experts.", "Ensure that all requests for changes are processed effectively, and in a timely manner.", "Monitor the overall progress of change evaluation, approval and implementation.", "Review the change records in regular intervals, to identify trends or nonconformities or poor documentation / traceability."],
      [{ name: "Change owner", count: "1 per change", tasks: [
        "Control and coordinate all activities in the lifecycle of a specific change.",
        "Monitor the progress of change evaluation and implementation for this change.",
        "Ensure that the change record is complete and up to date at any time from recording the RFC to completion of the post implementation review.",
        "As applicable, communicate with the release owner of the release containing this change."] }],
      [{ name: "Change advisory board (CAB)", type: "board", count: "1 board for a certain number of changes", specific: [
        "Evaluate non-standard changes, taking into account at least benefits, risks, potential impact, technical feasibility and effort / cost.",
        "Decide on the approval of non-standard changes, based on the evaluation results.",
        "Decide which changes can be considered pre-approved in the future."],
        notes: ["The CAB should be composed of (all) relevant stakeholders of the changes that are currently subject to evaluation and approval.", "CAB meetings should take place at regular intervals, although the specific composition of the CAB may / will vary."] }])
  },

  /* ───────────── PR13 RDM ───────────── */
  {
    id: "RDM", num: "PR13", name: "Release & Deployment Management", group: "control",
    pos: { x: 1150, y: 560 },
    objective: "To bundle changes into appropriate types of releases and to effectively deploy them",
    questions: [
      "How are different release and deployment strategies applied to different CIs?",
      "Which changes are included in which kinds of releases?",
      "How can releases be planned and tested prior to deployment?",
      "How do we know if a release was successful?",
      "How can unsuccessful deployments be reversed?"
    ],
    requirements: [
      ["PR13.1", "Release and deployment strategies shall be defined, together with the service components and CIs to which they are applied. Strategies shall be aligned with the frequency and impact of releases as well as the technology supporting deployment."],
      ["PR13.2", "Criteria for including approved changes in a release shall be defined, taking into consideration the applicable release and deployment strategy."],
      ["PR13.3", "Deployment of releases shall be planned, including acceptance criteria, as needed."],
      ["PR13.4", "Releases shall be built, tested and evaluated against acceptance criteria prior to being deployed. The extent of release testing shall be appropriate to the type of release and its potential impact on services."],
      ["PR13.5", "Deployment preparation shall consider steps to be taken in case of unsuccessful deployment."],
      ["PR13.6", "Deployment activities shall be evaluated for success or failure."]
    ],
    setup: [
      "Define a standardised way of defining and planning releases, based on approved changes and the schedule of changes.",
      "Define criteria for identifying different types of releases, such as major, minor or emergency releases.",
      "Define release and deployment strategies for all CIs under control of change management: the components and CIs they apply to and under what conditions, the frequency and manner of release, and the testing to be performed.",
      "Define a way to record the results of release and deployment testing and evaluation of acceptance criteria."
    ],
    inputs: ["Information on approved changes", "Change schedule", "Any release and deployment planning constraints or requirements"],
    outputs: ["Defined and successfully deployed releases", "Information / reports on the success and failure of releases"],
    activities: [
      { name: "Release planning", procedures: ["Build a release, based on the applicable release and deployment strategy", "Test a release"] },
      { name: "Release deployment", procedures: ["Plan and perform communication and training for users and support staff", "Prepare deployment of a release", "Deploy a release", "Review a release for success", "Inform stakeholders of the results of the release", "Close a release"] }
    ],
    databases: [
      { name: "Release records", src: "FitSM-0 §6.54 · FitSM-2 PR13",
        desc: "Records of each release — a set of one or more changes grouped together and deployed as a logical unit — including release type (major, minor, emergency), release plan, test results and evaluation against acceptance criteria, deployment outcome and success / failure reports.",
        usedBy: ["CHM", "CONFM", "ISRM", "PM"] },
      { name: "Release & deployment strategies", src: "FitSM-0 §6.55 · FitSM-1 PR13.1",
        desc: "The approaches taken to manage releases and their deployment for a given set of service components and CIs — e.g. continuous integration or fixed release cycles with emergency releases in between — covering planning, building, testing, evaluating, accepting and deploying.",
        usedBy: [] }
    ],
    roles: roles("RDM",
      ["Maintain the overall release planning, including release cycles.", "Manage the release and deployment strategies defined for the SMS.", "Apply the release and deployment strategies to defined groups of components, as appropriate.", "Review deployed releases for success."],
      [{ name: "Release owner", count: "1 per release", tasks: [
        "Identify the appropriate release and deployment strategy for a specific release.",
        "Control and coordinate the activities in the lifecycle of a specific release, including planning, building, testing and deploying.",
        "Ensure that the required documentation of the release (including release plans) is complete and of adequate quality.",
        "Act as a single point of contact for the release for all stakeholders of this release, including the change manager, affected change owners, developers, problem manager and customer representatives."] }])
  },

  /* ───────────── PR14 CSI ───────────── */
  {
    id: "CSI", num: "PR14", name: "Continual Service Improvement Management", group: "improve",
    pos: { x: 1150, y: 90 },
    objective: "To plan, implement and review improvements to services and processes",
    questions: [
      "How are opportunities for improving services and processes identified and evaluated?",
      "How is the implementation of actions for improvement controlled and monitored?"
    ],
    requirements: [
      ["PR14.1", "Opportunities for improvement of services and processes shall be identified and registered, based on reports as well as results from measurements, assessments and audits of the SMS."],
      ["PR14.2", "Opportunities for improvement shall be assessed to decide on necessary actions."],
      ["PR14.3", "The implementation of actions for improvement shall be controlled in a consistent manner."]
    ],
    setup: [
      "Identify all relevant sources of potential suggestions for improvement.",
      "Define a standardised way to record suggestions for improvements from the identified sources.",
      "Set up a tool (e.g. ticket / workflow tool) supporting the recording and handling (including prioritisation, evaluation, approval) of suggestions for improvement."
    ],
    inputs: ["Suggestions for improvements", "Results from measurements, assessments and audits of the SMS (nonconformities, deficiencies in process effectiveness and efficiency, deficiencies in service performance)", "Customer feedback from service reviews, complaints and satisfaction analysis / surveys", "Other sources of improvements"],
    outputs: ["Improvements to services or the SMS", "Requests for changes"],
    activities: [
      { name: "Manage evaluation of improvements", procedures: ["Identify and register an opportunity / suggestion for improvement", "Evaluate an opportunity / suggestion for improvement"] },
      { name: "Manage implementation of improvements", procedures: ["Initiate an action to address an improvement", "Track the status and progress of improvement actions"] }
    ],
    databases: [
      { name: "Improvement register", src: "FitSM-2 PR14 · FitSM-0 §6.28",
        desc: "Registered opportunities / suggestions for improvement from all identified sources, with their evaluation, priority, approval or rejection, and the improvement actions initiated with their status and progress. An improvement is an action to increase the conformity, effectiveness or efficiency of the SMS, a process or activity, or the quality or performance of a service or service component.",
        usedBy: ["CHM"] }
    ],
    roles: roles("CSI",
      ["Review the status and progress of ongoing improvements in regular intervals."],
      [{ name: "Improvement owner", count: "1 per improvement", tasks: ["Maintain the improvement under their ownership.", "Coordinate the activities to implement the improvement."] }])
  }
];

/*
 * Key interfaces (FitSM-2 “Key interfaces” tables).
 * sender  = text from the sending process's “To process / Output” table
 * receiver = text from the receiving process's “From process / Input” table
 * route   = optional waypoints for drawing; pair = offset for two-way links
 */
const INTERFACES = [
  { from: "CRM", to: "SPM", items: ["Identified customer requirements"],
    sender: "Identified customer requirements as a factor to be considered to identify demand for new or changed services",
    receiver: "Identified customer requirements as a factor to be considered to identify demand for new or changed services" },
  { from: "SUPPM", to: "SPM", pair: 1, items: ["Information on suppliers"],
    sender: "Information on suppliers as a basis for identifying suppliers involved in the delivery of a given service",
    receiver: "Information on suppliers as a basis for identifying suppliers involved in the delivery of a given service" },
  { from: "SPM", to: "SUPPM", pair: 1, items: ["Information on internal and external suppliers involved in delivering a given service", "Plans for new or changed services"],
    sender: "Information on internal and external suppliers involved in delivering a given service (part of plans for new or changed services) as a basis for the identification of new suppliers",
    receiver: "Information on internal and external suppliers involved in delivering a given service (part of plans for new or changed services) as a basis for the identification of new suppliers" },
  { from: "SPM", to: "SLM", items: ["Service portfolio", "Service specifications"],
    sender: "Service portfolio together with service specifications as a basis for creating the service catalogue",
    receiver: "Service portfolio together with service specifications as a basis for creating the service catalogue" },
  { from: "SPM", to: "CHM", items: ["Requests for changes (RFCs)", "Plans for new or changed services"], route: [[410, 165], [830, 165]],
    sender: "Requests for changes to trigger changes to configuration items (CIs) as required to implement plans for new or changed services",
    receiver: "Request for change to trigger the CHM process (listed by CHM as an input from any process)" },
  { from: "CRM", to: "SLM", pair: 1, items: ["Information on customers", "Customer-specific service level requirements"],
    sender: "Information on customers and identified customer-specific service level requirements (e.g. based on customer feedback or resulting from service reviews with customers) as a basis for defining SLAs",
    receiver: "Information on customers and identified customer-specific service level requirements (e.g. based on customer feedback or resulting from service reviews with customers) as a basis for defining SLAs" },
  { from: "SLM", to: "CRM", pair: 1, items: ["Service catalogue", "SLAs", "Service reports"],
    sender: "Service catalogue for available services that are offered to customers. SLAs reflecting what has been agreed with customers together with service reports to support service reviews with customers",
    receiver: "Service catalogue for available services that are offered to customers. SLAs reflecting what has been agreed with customers together with service reports to support service reviews with customers" },
  { from: "SUPPM", to: "SLM", pair: 1, items: ["Information on suppliers"],
    sender: "Information on suppliers as a basis for new or updated OLAs and UAs",
    receiver: "Information on suppliers as a basis for defining OLAs and UAs" },
  { from: "SLM", to: "SUPPM", pair: 1, items: ["OLAs", "UAs", "Reports on operational targets"],
    sender: "OLAs and UAs together with reports on operational targets to support supplier performance evaluation",
    receiver: "OLAs and UAs together with reports on operational targets to support supplier performance evaluation" },
  { from: "SLM", to: "SRM", items: ["SLAs with agreed service targets (reporting requirements)", "Data from evaluation of SLAs, OLAs and UAs"],
    sender: "SLAs with agreed service targets as a basis for identifying service reporting requirements, i.e. understanding the reporting requirements agreed in SLAs. Data from evaluation of SLAs, OLAs and UAs as a basis for reports",
    receiver: "SLAs with agreed service targets as a basis for identifying service reporting requirements, i.e. understanding the reporting requirements agreed in SLAs. Data from evaluation of SLAs, OLAs and UAs as a basis for reports" },
  { from: "SLM", to: "SACM", items: ["SLAs with agreed availability and continuity targets"],
    sender: "SLAs with agreed service availability and continuity targets as a basis for identifying overall availability and continuity requirements",
    receiver: "SLAs with agreed service availability and continuity targets as a basis for identifying overall availability and continuity requirements" },
  { from: "SLM", to: "CAPM", items: ["SLAs with agreed capacity and performance targets"],
    sender: "SLAs with agreed capacity and performance targets as a basis for identifying overall capacity and performance requirements",
    receiver: "SLAs with agreed capacity and performance targets as a basis for identifying overall capacity and performance requirements" },
  { from: "SLM", to: "ISM", items: ["SLAs with agreed information security targets"],
    sender: "SLAs with agreed information security targets as a basis for identifying overall security requirements",
    receiver: "SLAs with agreed information security targets as a basis for identifying overall security requirements" },
  { from: "SLM", to: "ISRM", items: ["SLAs with agreed service targets"],
    sender: "Service level agreements (SLAs) containing information on agreed service targets to enable prioritisation of incidents and service requests",
    receiver: "SLAs containing information on agreed service targets to enable prioritisation of incidents and service requests",
    note: "FitSM-2 v3.0.2 prints this output in the SPM interface table, while ISRM names SLM as its source. SLAs are an SLM output, so the diagram draws it as SLM → ISRM." },
  { from: "SACM", to: "SRM", items: ["Service availability data"],
    sender: "Service availability data as a basis for reports", receiver: "Service availability data as a basis for reports" },
  { from: "CAPM", to: "SRM", items: ["Performance and utilisation data"], route: [[765, 300], [765, 104]],
    sender: "Performance and utilisation data as a basis for reports", receiver: "Performance and utilisation data as a basis for reports" },
  { from: "SRM", to: "CRM", items: ["Relevant (service) reports"], route: [[500, 128]],
    sender: "Relevant reports as a basis for managing customer relationships and customer satisfaction",
    receiver: "Relevant reports as a basis for managing customer relationships and customer satisfaction" },
  { from: "SRM", to: "CSI", items: ["Service reports"],
    sender: "Service reports as an information basis related to opportunities for improving services and the SMS",
    receiver: "Service reports as an information basis related to opportunities for improving services and the SMS" },
  { from: "SACM", to: "CHM", items: ["Requests for changes (RFCs)"],
    sender: "Requests for change addressing required updates or modifications to CIs as a basis for implementing the measures necessary to enable the IT service environment to meet identified availability and continuity requirements",
    receiver: "Request for change to trigger the CHM process (listed by CHM as an input from any process)" },
  { from: "CAPM", to: "CHM", items: ["Requests for changes (RFCs)"],
    sender: "Requests for changes addressing required updates or modifications to CIs as a basis for implementing the capacity planning to enable the IT service environment to meet identified capacity and performance requirements",
    receiver: "Request for change to trigger the CHM process (listed by CHM as an input from any process)" },
  { from: "ISM", to: "CHM", items: ["Requests for changes (RFCs)"],
    sender: "Requests for changes addressing required updates or modifications to CIs as a basis for implementing the information security controls as far as they relate to CIs supporting the services",
    receiver: "Request for change to trigger the CHM process (listed by CHM as an input from any process)" },
  { from: "CRM", to: "CHM", items: ["Requests for changes (RFCs)"], route: [[232, 205], [232, 522], [800, 522]],
    sender: "Requests for changes (e.g. to address insufficient customer satisfaction, feedback from service reviews or customer complaints)",
    receiver: "Request for change to trigger the CHM process (listed by CHM as an input from any process)" },
  { from: "CRM", to: "CSI", items: ["Suggestions for improvement"], route: [[110, 28], [1150, 28]],
    sender: "Suggestions for improvement (e.g. to address insufficient customer satisfaction, feedback from service reviews or customer complaints)",
    receiver: "Suggestions for improving services and the SMS that require control and coordination through the CSI process (listed by CSI as an input from any process)" },
  { from: "ISRM", to: "PM", pair: 1, items: ["Trend information on incidents", "Incident tickets and reports"],
    sender: "Trend information on incidents, including information from incident tickets and reports, to enable pattern and trend analysis",
    receiver: "Trend information on incidents, including information from incident tickets and reports, to enable pattern and trend analysis" },
  { from: "PM", to: "ISRM", pair: 1, items: ["Known error database (KEDB)", "Known errors and workarounds"],
    sender: "Known error database (KEDB) containing information on known errors and related workarounds to support the resolution of incidents caused by known errors",
    receiver: "Known error database (KEDB) containing information on known errors and related workarounds to support the resolution of incidents caused by known errors" },
  { from: "ISRM", to: "CHM", items: ["Requests for changes (RFCs)"],
    sender: "Requests for changes required to resolve incidents or to fulfil service requests",
    receiver: "Request for change to trigger the CHM process (listed by CHM as an input from any process)" },
  { from: "PM", to: "CHM", items: ["Requests for changes (RFCs)"],
    sender: "Requests for changes to resolve / eliminate problems",
    receiver: "Request for change to trigger the CHM process (listed by CHM as an input from any process)" },
  { from: "CONFM", to: "ISRM", items: ["Configuration information (CMDB)"], route: [[870, 768], [370, 768]],
    sender: "Configuration information from the CMDB to support process activities (listed by CONFM as an output to any process)",
    receiver: "CMDB containing information on configuration items and their relationships to support the classification, prioritisation, escalation and resolution of incidents and the fulfilment of service requests" },
  { from: "CONFM", to: "PM", items: ["Configuration information (CMDB)"],
    sender: "Configuration information from the CMDB to support process activities (listed by CONFM as an output to any process)",
    receiver: "CMDB containing information on configuration items and their relationships to support the classification, prioritisation and investigation of problems" },
  { from: "CONFM", to: "RDM", pair: 1, items: ["Configuration information (CMDB)"],
    sender: "Configuration information from the CMDB to support process activities (listed by CONFM as an output to any process)",
    receiver: "Configuration information (CMDB) as a basis for informed decisions in deployment planning" },
  { from: "RDM", to: "CONFM", pair: 1, items: ["Information on the deployment of releases", "Changes to CIs included in the releases"],
    sender: "Information on the deployment of releases (and the changes to CIs included in the releases) required to update the CMDB and (if necessary) introduce new CI types",
    receiver: "Information on the deployment of releases (and the changes to CIs included in the releases) required to update the CMDB and (if necessary) introduce new CI types" },
  { from: "RDM", to: "ISRM", items: ["Information on planned or recently deployed releases"], route: [[460, 562]],
    sender: "Information on planned or recently deployed releases to support incident resolution (e.g. to understand if incidents are potentially related to releases)",
    receiver: "Information on planned or recently deployed releases to support incident resolution (e.g. to understand if incidents are potentially related to releases)" },
  { from: "CHM", to: "CONFM", pair: 1, items: ["Information on planned, approved and / or implemented changes to CIs"],
    sender: "Information on planned, approved and / or implemented changes to CIs to be reflected in the CMDB",
    receiver: "Information on the deployment of releases (and the changes to CIs included in the releases) required to update the CMDB and (if necessary) introduce new CI types",
    note: "FitSM-2 v3.0.2 lists CHM as the source of this CONFM input, but the wording matches RDM’s output. Both CHM (changes to CIs) and RDM (deployed releases) keep the CMDB up to date." },
  { from: "CONFM", to: "CHM", pair: 1, items: ["Configuration information (CMDB)"],
    sender: "Configuration information from the CMDB to support process activities (listed by CONFM as an output to any process)",
    receiver: "Not listed explicitly by CHM; CONFM supplies configuration information to any process, including impact assessment of changes.",
    note: "Implied by CONFM’s “To: Any” interface rather than a named row in FitSM-2." },
  { from: "CHM", to: "RDM", pair: 1, items: ["Approved and planned changes ready for deployment", "Change schedule with proposed deployment dates"],
    sender: "Approved and planned changes that are ready for deployment to be considered for future / upcoming releases (depending on defined criteria and applicable release and deployment strategies). Change schedule with proposed deployment dates for planned and approved changes / basis for planning and scheduling releases",
    receiver: "Approved and planned changes that are ready for deployment to be considered for future / upcoming releases (depending on defined criteria and applicable release and deployment strategies). Change schedule with proposed deployment dates for planned and approved changes / basis for planning and scheduling releases" },
  { from: "RDM", to: "CHM", pair: 1, items: ["Release records (information on deployed releases)"],
    sender: "Information on deployed releases (release records) to allow for post implementation review of the bundled changes",
    receiver: "Information on planned releases and deployments (CHM process input)" },
  { from: "CSI", to: "CHM", items: ["Requests for changes (RFCs)"],
    sender: "Requests for changes to trigger the change management process, in order to implement improvements (where needed)",
    receiver: "Request for change to trigger the CHM process (listed by CHM as an input from any process)" }
];

/* “Any process” interfaces — drawn as badges on the node, not as arrows */
const ANY_INTERFACES = [
  { process: "CONFM", dir: "out", items: ["Configuration information (CMDB)"],
    text: "Configuration information from the CMDB to support process activities" },
  { process: "CHM", dir: "in", items: ["Requests for changes (RFCs)"],
    text: "Request for change to trigger the CHM process" },
  { process: "CSI", dir: "in", items: ["Suggestions for improvement"],
    text: "Suggestions for improving services and the SMS that require control and coordination through the CSI process" }
];
