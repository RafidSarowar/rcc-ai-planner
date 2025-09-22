import { GoogleGenAI, Type } from "@google/genai";
import type { SchedulePlan, TransferAgreements } from '../types';
import { TRANSFER_AGREEMENTS } from '../constants';


// Assumes API_KEY is set in the environment
if (!process.env.API_KEY) {
    throw new Error("API_KEY environment variable is not set.");
}
const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

interface GenerateScheduleParams {
    major: string;
    transferUniversity: string;
    years: number;
    startTerm: string;
    unitsPerTerm: { min: number; max: number };
    includeWinter: boolean;
    includeSummer: boolean;
    additionalNotes: string;
}

const courseSchema = {
    type: Type.OBJECT,
    properties: {
        code: { type: Type.STRING, description: "Course code, e.g., 'CIS-5'" },
        name: { type: Type.STRING, description: "Full name of the course" },
        units: { type: Type.NUMBER, description: "Number of units for the course" },
        description: { type: Type.STRING, description: "Brief description of the course" },
        prerequisites: {
            type: Type.ARRAY,
            items: { type: Type.STRING },
            description: "List of prerequisite course codes. Should be an empty array if none."
        },
        corequisites: {
            type: Type.ARRAY,
            items: { type: Type.STRING },
            description: "List of corequisite course codes. Should be an empty array if none."
        },
        ge_category: {
            type: Type.ARRAY,
            items: { type: Type.STRING },
            description: "List of General Education categories fulfilled. Should be an empty array if none."
        },
        transfer_category: {
            type: Type.ARRAY,
            items: { type: Type.STRING },
            description: "List of Transfer categories fulfilled (CSU GE or IGETC). Should be an empty array if none."
        },
    },
    required: ['code', 'name', 'units', 'description']
};

const responseSchema = {
    type: Type.ARRAY,
    items: {
        type: Type.OBJECT,
        properties: {
            year: { type: Type.NUMBER, description: "The academic year number (e.g., 1, 2)" },
            semesters: {
                type: Type.OBJECT,
                properties: {
                    'Fall': {
                        type: Type.ARRAY,
                        items: courseSchema,
                        description: "List of courses for Fall term."
                    },
                    'Winter Intersession': {
                        type: Type.ARRAY,
                        items: courseSchema,
                        description: "List of courses for Winter Intersession. Empty if not included or no courses."
                    },
                    'Spring': {
                        type: Type.ARRAY,
                        items: courseSchema,
                        description: "List of courses for Spring term."
                    },
                    'Summer Intersession': {
                        type: Type.ARRAY,
                        items: courseSchema,
                        description: "List of courses for Summer Intersession. Empty if not included or no courses."
                    },
                },
                required: ['Fall', 'Spring', 'Winter Intersession', 'Summer Intersession']
            }
        },
        required: ['year', 'semesters']
    }
};

export const generateSchedule = async (params: GenerateScheduleParams): Promise<SchedulePlan> => {
    const {
        major,
        transferUniversity,
        years,
        startTerm,
        unitsPerTerm,
        includeWinter,
        includeSummer,
        additionalNotes,
    } = params;

    const transferInfo = TRANSFER_AGREEMENTS[transferUniversity as keyof TransferAgreements]?.[major]
        ? `Here is the transfer agreement information for ${transferUniversity} for the ${major} major: ${JSON.stringify(TRANSFER_AGREEMENTS[transferUniversity as keyof TransferAgreements][major])}`
        : 'There is no specific transfer agreement provided for this major and university combination. Please select courses that fulfill general education and major preparation requirements.';

    const prompt = `
        You are an expert academic advisor for a community college. Your task is to create a personalized academic plan for a student based on their preferences.
        The plan should be structured as a JSON array of academic years.

        Student Preferences:
        - Major: ${major}
        - Desired Transfer University: ${transferUniversity}
        - Plan Duration: ${years} years
        - Starting Term: ${startTerm}
        - Units per Term: ${unitsPerTerm.min} to ${unitsPerTerm.max}
        - Include Winter Intersession: ${includeWinter}
        - Include Summer Intersession: ${includeSummer}
        - Additional Notes: ${additionalNotes || 'None'}
        
        ${transferInfo}

        Here is the relevant excerpt from the course catalog. Use this to select appropriate courses. Ensure all prerequisites are met before a course is scheduled. Prioritize required courses for the major and transfer agreement first, then fill the schedule with general education courses.
        Course Catalog Data:
        ${COURSE_CATALOG_DATA}

        Instructions:
        1. Create a ${years}-year plan, starting from Year 1.
        2. The first term of Year 1 should be ${startTerm}.
        3. For each term, select courses that fulfill major requirements, transfer requirements, and general education requirements.
        4. Strictly adhere to course prerequisites listed in the catalog. A course cannot be taken before its prerequisites are completed.
        5. The total units for each Fall and Spring term must be between ${unitsPerTerm.min} and ${unitsPerTerm.max}. Units for Winter and Summer intersessions can be lower.
        6. If "Include Winter Intersession" is false, the 'Winter Intersession' array for all years must be empty.
        7. If "Include Summer Intersession" is false, the 'Summer Intersession' array for all years must be empty.
        8. Populate all fields for each course object (code, name, units, description). Also include prerequisites, corequisites, ge_category, and transfer_category if they are mentioned in the course catalog data. If a course has no prerequisites, corequisites, ge_category, or transfer_category, return an empty array for those fields.
        9. Ensure the final output is a valid JSON that strictly follows the provided schema. Do not include any text or explanations outside of the JSON object.
    `;

    const response = await ai.models.generateContent({
        model: "gemini-2.5-flash",
        contents: prompt,
        config: {
            responseMimeType: "application/json",
            responseSchema: responseSchema,
        },
    });

    try {
        const jsonText = response.text.trim();
        // Sometimes the model might return the JSON wrapped in markdown ```json ... ```
        const sanitizedJsonText = jsonText.replace(/^```json\s*/, '').replace(/```$/, '');
        const plan = JSON.parse(sanitizedJsonText) as SchedulePlan;
        return plan;
    } catch (e) {
        console.error("Failed to parse Gemini response as JSON", e);
        console.error("Raw response text:", response.text);
        throw new Error("The AI returned an invalid schedule format. Please try again.");
    }
};

const COURSE_CATALOG_DATA = `
== GENERAL INFORMATION AND POLICIES ==

Course Descriptions
The Courses section of the catalog includes a description of courses which the Board of Trustees has authorized the District to offer. The information listed is accurate as of the catalog publication date, but from time to time this varies based on changes that occur at four-year institutions. It is always advisable to check with a counselor and the four-year transfer institution for current updates. The complete course outlines of record including student learning outcomes can be found at https://rccd.curriqunet.com.

Course Types
Credit Courses
Credit courses can be degree or non-degree applicable. Unlike non-credit courses, they do carry units based on the number of hours of lecture, lab, or both that are required in the official course outline for the course. These courses are in a wide variety of areas; each requires critical thinking, reading and writing, and assignments that are completed outside of class that require the student to study and work independently. Credit courses are approved by the District and College Curriculum Committees and the Board of Trustees.

Non-Degree Credit
These courses earn credit, but the credit is not counted toward the associate degree. They are intended to help students develop skills necessary to succeed in college level degree-applicable courses. Non-degree credit courses can be used toward the following: athletic eligibility, work study, financial aid, social security benefits, veteran’s benefits, associated student body office, and full-time status.

The following courses are non-degree credit:
Academic Literacy and Reading (ALR): 83, 86
Communication Studies (COMM): 51, 85A, 85B
Cosmetology (COS): 97A, 97B, 98A, 98B, 99A, 99B
English (ENGL): 85, 91
English as a Second Language (ESL): 46, 47, 48, 65, 71, 72, 90D, 90L, 90M, 90P, 91, 92, 95
Interdisciplinary Studies (ILA): 3
Mathematics (MAT): 42, 52, 101A, 105, 109, 112, 125, 136
Nursing Assistant (NNA): 80, 80A, 80B, 81, 86
Registered Nursing (NRN): 11B, 11C, 12B, 12C, 18, 21B, 21C, 22B, 22C, 100, 107
Vocational Nursing (NVN): 42B, 42C, 44B, 44C, 52A, 62A
Continuing Education in Nursing (NXN): 81
Psychology (PSYC): 148
Sociology (SOC): 148

Non-Credit
These courses are numbered in the 800’s and are non-credit classes. No unit credit is earned in these courses.

Limitations on Enrollment
Please check the course description carefully to see if there are any prerequisites, corequisites, advisories, or other limitations on enrollment.

Prerequisite - When a course has a prerequisite, it means that the corresponding discipline has determined that the student must have certain knowledge to be successful in the course. The prior knowledge may be a skill (type 40 WPM), an ability (speak and write French fluently), a preparation score (placement test and prior academic background), or successful completion of a course (grade of “C” or better or “P”). Completion of the prerequisite is required prior to enrolling in the class. Successful completion of a prerequisite requires a grade of “C” or better or “P” (Pass). “C-”, “D”, “F”, “FW”, “NP” (No Pass), or “I” are not acceptable.

Students currently enrolled in a prerequisite course at Riverside Community College District (i.e. Math 52) will be allowed to register for the succeeding class (i.e. Math 35). However, if the prerequisite course is not passed with at least a C grade, the student will be dropped from the succeeding class.

Corequisite - When a course has a corequisite, it means that a student is required to take another course concurrent with or prior to enrollment in the course. Knowing the information presented in the corequisite course is considered necessary for a student to be successful in the course. (Completion of, or concurrent enrollment in, Math 1A is required for Physics 4A.)

Advisory - When a course has an advisory, it means that a student is recommended to have a certain preparation before entering the course. The preparation is considered advantageous to a student’s success in the course. Since the preparation is advised, but not required, the student will not be blocked from enrolling in a class if the advisory is not met.

Verifying Prerequisites/Corequisites - It is the student’s responsibility to know and meet the course prerequisites and corequisites. These are stated in the course descriptions within the schedule of classes and the college catalogs.

If you have met the prerequisites at another accredited college or university, you must provide verification through one of the following:
• Submit official transcript(s) and complete a Prerequisite Validation form.
• Submit unofficial transcript(s) or grade reports and complete a Matriculation Appeals petition.
Petitions approved on an unofficial transcript will be approved for one semester only. This will provide time for the student to request official transcripts.
• Coursework must be listed on the original transcript. Coursework listed on a secondary transcript is not acceptable documentation.
• If you wish to challenge a prerequisite for courses other than English, ESL, math or reading on the basis of knowledge or ability or because of the unavailability of the prerequisite, submit a Matriculation Appeals petition at any of our campus’s counseling offices.
• Successful completion of some high school courses are accepted by the discipline as an appeal to existing prerequisites and/or corequisites.
Petitions to challenge a prerequisite are available in the Counseling Offices on all three colleges.

Grading System
Riverside Community College District uses the letter system of grading the quality of work performed by students. The following grades are used “A”, excellent; “B”, above average; “C”, average; “D”, below average; “F”, fail; “FW”, failing due to cessation of participation in a course after the last day to officially withdraw from a course and without having achieve a final passing grade; “I”, incomplete; “IP”, in progress; “RD”, report delayed; “P”, pass; “NP”, no pass; “W”, formal withdrawal from the college or a course; "EW", excused withdrawal; “MW”, military withdrawal; "SP", satisfactory progress towards completion of a noncredit course (not supplanted by any other symbol).

Grade Points
On the basis of scholarship grades, grade points are awarded as follows: “A”, 4 points per units of credit; “B”, 3 points per unit of credit; “C”, 2 points per unit of credit; “D”, 1 point per unit of credit; “F” or “FW”, no points per unit of credit. On computing the grade point average, units attempted are not charged and grade points are not awarded for the following: “I”, “W”, “NP”, “P”, “IP”, “RD”, "EW" or “MW.”

Incomplete
An “I” is given only in cases where a student has been unable to complete academic work for unforeseeable, emergency and justifiable reasons. The condition for removal of the “I” shall be stated by the instructor in a written contract submitted online on MyPortal. A copy of this Incomplete Contract will be sent to the student’s college email and is also available on MyPortal. A final grade shall be assigned when the work stipulated has been completed and evaluated, or when the time limit for completing the work has passed. The “I” may be made up no later than one year following the end of the term in which it was assigned. The “I” symbol shall not be used in calculating units attempted nor for grade points. The “I” symbol will be changed to the grade the instructor has predetermined if the student does not meet the conditions of the agreement.

Military Withdrawal
Military withdrawal occurs when a student who is a member of an active or reserve United States military service receives orders compelling a withdrawal from courses. Upon verification of such orders, a withdrawal symbol may be assigned at any time after the period established by the governing board during which no notation is made for withdrawals. Military withdrawals are not counted in progress probation and dismissal calculations. A “W” incurred during the period between January 1, 1990 and the effective date of this paragraph, which meet the definition of military withdrawal herein, are not counted in progress probation and dismissal calculations and may be changed to “MW”.
Students should refer to MyPortal for withdrawal deadlines.

Grade Changes
Students have one year following the term in which the grade was recorded to request a change of grade. After the one-year limit, the grade is no longer subject to change. Students must file an Extenuating Circumstances Petition (ECP) with the Admissions and Records office at one of the three Colleges.

Extenuating Circumstances Petition
This petition is for students who encounter situations involving extenuating circumstances, emergencies that may affect their education records and fall outside the realm of normal college policy and procedures. Failure to be aware of deadlines and expected failure in a course are not acceptable reasons for filing an Extenuating Circumstances Petition. The student bears the burden and is responsible for showing that grounds exist for the Extenuating Circumstances Petition (ECP). Students have one year following the term in which a grade was submitted to request a change of grade.

Auditing Classes
RCCD offers students the option of auditing courses. Instructions for auditing are as follows:
• Students may not audit a class unless he/she has exhausted all possibilities to repeat the class for credit.
• Permission to audit a class is done at the discretion of the instructor and with instructor’s signature.
• When auditing, student shall not be permitted to change his/her enrollment in that course to receive credit.
• With the instructor’s signature and permission, a credit student may switch his/her enrollment to audit status as long as no more than 20 percent of the course has been completed.
• With the instructor’s signature and permission, a student may enroll in a course for audit at any time during the semester if he/she has not enrolled in that course for credit during the same semester.
• No student will be allowed to enroll for audit prior to the first day of the course. The first day of the course refers to the actual course meeting.
• Credit students have priority over auditors. If a course closes after an auditor has been admitted, the auditor may be asked to leave to make room for the credit student. Instructor’s discretion is strongly recommended.
• The audit fee is $15 per unit. Students enrolled in 10 or more semester units may audit an additional 3 units free (may be 3 one-unit courses). The $15 per unit audit fee will automatically be charged if the student drops below 10 units.

Students wishing to audit should be aware that audited classes will not appear on the RCCD transcript. Forms and information are available at the Admissions offices on the Riverside City, Moreno Valley and Norco colleges.

Pass/No Pass Classes
Discipline faculty are responsible for determining the appropriate Pass/No Pass option for each course. All sections of the course must be offered in the same manner. Courses may be offered for Pass/No Pass in either of the following categories and will be specified in the catalog:
• Class sections wherein all students are evaluated on a Pass/No Pass basis.
• Courses in which each student has the option to individually elect Pass/No Pass or letter grade. Students electing this option must file a petition in Admissions at Riverside, Moreno Valley, or Norco by the end of the second week of the semester or by the end of the first 20 percent of a shorter-than-semester term.
Units earned on a Pass/No Pass basis in accredited California institutions of higher education or equivalent out-of-state institutions are counted in satisfaction of community college curriculum and graduation requirements.
Units earned on a Pass/No Pass basis are not used to calculate grade point averages. Although no grade points are earned, a pass grade is granted through RCCD for performance that is equivalent to the letter grade of "C" or better. However, units attempted for which NP is recorded are considered in probation and dismissal procedures. Students should consult with a counselor before changing the grading option on a course. Other institutions may have unit or other restrictions regarding the acceptance of Pass/No Pass.

Final Examinations - Final Grades
Final semester exams are required in all classes at the scheduled time and place. Failure to appear for a final examination may result in an “F” grade in the course. Final grades may be obtained on MyPortal immediately after they are submitted by the instructor.

Dean's List
Each semester, those students who have demonstrated outstanding scholastic achievement by completing at least 12 units of credit-graded work in one semester or 12 units of credit-graded work earned in no more than one academic year (fall, winter and spring, with summer being excluded) with a grade point average of 3.0 or better (completed units will be considered only once for a particular dean’s list) will be recognized by a letter from the Dean of Instruction.

UC and CSU Transferable Courses
Some course descriptions are notated with "UC," "CSU," or both. These courses are transferable to the campuses of the University of California and the California State University system. Courses that are not marked UC are not transferable to University of California campuses. Copies of the UC transfer course list indicating credit unit limitations are available in the Transfer/Career Center on all three colleges. When in doubt, students are advised to confer with a counselor.

Course Identification Numbering System (C-ID)
Some courses are notated with a C-ID number. The Course Identification Numbering System (C-ID) is a statewide numbering system independent from the course numbers assigned by local California community colleges. A C-ID number next to a course signals that participating California colleges and universities have determined that courses offered by other California community colleges are comparable in content and scope to courses offered on their own campuses, regardless of their unique titles or local course number. Thus, if a schedule of classes or catalog lists a course bearing a C-ID number, for example COMM 110, students at that college can be assured that it will be accepted in lieu of a course bearing the C-ID COMM 110 designation at another community college. In other words, the C-ID designation can be used to identify comparable courses at different community colleges. However, students should always go to www.assist.org to confirm how each college’s course will be accepted at a particular four-year college or university for transfer credit.
The C-ID numbering system is useful for students attending more than one community college and is applied to many of the transferable courses students need as preparation for transfer. Because these course requirements may change and because courses may be modified and qualified for or deleted from the C-ID database, students should always check with a counselor to determine how C-ID designated courses fit into their educational plans for transfer.

Delivery Methods
A variety of delivery methods are used to offer classes at Riverside Community College District, including face-to-face classroom instruction and distance delivery methods such as hybrid classes and online classes (taught entirely online utilizing computer and Internet technology). Enrollment in online classes is limited to students who have demonstrated competency in working in the online environment.

Distance Education Courses
The mission of RCCD Distance Education is to support the social and economic mobility of its students by ensuring access, success, and equity for everyone through the efficient, effective, accountable, and transparent use of distance education resources. The District offers courses that meet in a variety of formats. Students are required to regularly engage and attend their courses. Engagement and attendance in fully online courses are measured by the completion of learning activities such as assignments, discussions, quizzes, or other online activities.
Learning through distance education is accomplished by supporting student access to online courses through Canvas, making learning possible anytime from anywhere. Accessing your course with a desktop or laptop computer is necessary to fully participate in online courses. Accordingly, a mobile device is not appropriate to fully interact with the course. A reliable internet connection is required. Canvas runs on Windows, Mac, Linux, or any other device with a modern web browser. Consult the instructor of record prior to course enrollment to ensure you are able to access the required applications used throughout the course including test or assessment proctoring software.
Canvas student support and other resources such as 24-hour Canvas support, a Canvas training course, and tutorials can be accessed by following the student link on the Distance Education website at https://rccd.edu/de.
Students enrolled in fully online courses are expected to log in to Canvas on the first day of the semester and complete initial learning activities in the first week of the session. Students may be dropped from the course if initial learning activities are not completed in the first week of the course and may forfeit their place in the class at the discretion of the Instructor of Record. Throughout the course, online students regularly fulfill attendance requirements outlined in the syllabi by logging in to classes for which they are registered and completing assignments. Students are required to read and adhere to the attendance policy described in the syllabus of each online class for which they are enrolled.
Distance Education courses are academically equivalent to their face-to-face counterparts. They are available in the following formats:
• Online Course (ONLN) - Online classes are distance education classes with no scheduled meeting days.
• Regular Meeting (REG MEET) - These classes meet virtually on a fixed schedule for live online lectures (typically through Zoom). No in-person meetings occur, but students are expected to attend each online class session. Additionally, students will log in to Canvas and complete work regularly.
• Occasional Meeting (OCC MEET) - These classes meet virtually on occasion for live online lectures (typically through Zoom). No in-person meetings occur. Additionally, students will log in to Canvas and complete work regularly.
• Hybrid (HYB) - Hybrid classes are partially online with scheduled in-person meetings that occur on campus. Additionally, students will log in to Canvas and complete work regularly.
Some certificate programs can be completed fully online. For further information, students should consult a counselor. Students should also review their Student Educational Plan with a counselor before taking any class to be sure it meets their academic and educational goals.
NOTE: If the in-person portion of a hybrid course is discontinued and the course cannot be completed through distance education, it will be canceled.

Face-to-Face Courses
Riverside Community College District (RCCD) has adopted the following policy with regard to attendance. Nothing in this policy shall conflict with Title 5, section 58003, 58004, that pertains to state requirements for monitoring and reporting attendance for apportionment purposes. The faculty, staff, and administration of RCCD expect all students to attend every meeting of all classes for which they are registered. Of particular importance is the first class meeting of the semester during which the Instructors of Record determine adds and drops. Students who have enrolled for a class and who do not attend the first class meeting effectively forfeit their place in the class and, as a result, may be dropped by the Instructor of Record. Furthermore, students who are late for the first meeting of the class may be forfeiting their place in the class and may be dropped by the Instructor of Record. The faculty, staff, and administration of RCCD are therefore strongly recommending that all students are present in each of their classes at the start of all of their classes and that all students should know and understand the attendance policy for every class in which they are enrolled.

Course Repetition
Non-Repeatable Courses:
Students are permitted to enroll in a non-repeatable course up to three times in order to alleviate substandard academic work. Substandard grades (D, F, FW, NC, and NP) and withdrawals (W) are included in the total attempts; military withdrawals (MW) and Excused Withdrawals (EW) are NOT included. The most recent grade will be the grade calculated into the student’s GPA. If a student repeats a course that is not designated as repeatable and receives a satisfactory grade, then the student may not repeat the course again unless there is another provision that allows the repetition. Students must file a “Course Repetition” form to repeat a non-repeatable course.

Repeatable Courses:
Students may repeat courses in which a "C" or better grade was earned only for the following types of courses: courses for which repetition is necessary to meet the major requirements of CSU or UC for competion of a bachelor's degree, intercollegiate athletics, and intercollegiate academic or vocational competition courses that are related in content. The designation of whether a course is repeatable is indicated in the course description.

For more information, please see the complete Board Policy and Administrative Procedure on course repetition:
BP 2225: Course Repetition
References: Title 5 Sections 55040, 55041, 55042, 55044, and 58161
Students may repeat courses in which substandard grades (less than “C,” and including “FW”) were earned. The Board of Trustees shall establish reasonable limitations on course repetition as set forth in Administrative Procedure 2225 Course Repetition.
When course repetition occurs, the permanent academic record shall be annotated in such a manner that all work remains legible, ensuring a true and complete academic history. The most recent grade earned shall be used to compute the GPA.
The Chancellor, in consultation with the District Academic Senate, shall establish procedures to implement this policy.

AP 2225: Course Repetition
Reference: Education Code Section 76244; Title 5 Sections 55040, 55041, 55042, 55043, 55044, 55253, 56029, and 58161
Students may repeat both Non-Repeatable and Repeatable courses that are current courses within the District according to this procedure.
In accordance with BP 2225, for courses taken or repeated at external accredited colleges and universities, the most recent grade earned in the repeated course will be used to compute an adjusted cumulative grade point average (GPA). The adjusted cumulative GPA will be used in determining eligibility for the cumulative GPA requirement for the Associate in Arts degree, Associate in Science degree, Associate for Transfer degree and occupational certificates. Once the courses, units, and grades from another accredited college or university are posted to the student’s permanent record, they cannot be removed.
1. All external courses will be included in the student’s cumulative units, grades, and grade points.
2. RCCD will honor prior coursework repetition actions by other accredited colleges and universities.
3. A student may petition to have substandard coursework at RCCD alleviated by equivalent coursework completed at an external accredited college or university and be used to determine RCCD academic standing.
4. A student’s substandard coursework at an external college or university will not be alleviated on a RCCD transcript with RCCD coursework.
5. All coursework taken at an accredited college or university will count towards unit totals, degree or certificate requirements, CSU Breadth and UC IGETC requirements, where applicable and appropriate.

A Request for Course Repetition is required and can be obtained online or from the college Admissions offices and from the offices of the Dean of Instruction at the three colleges. Requests are approved or denied by a Dean of Instruction, or designee.
Students may repeat courses under the courses Repetition Policy, however students must check with financial aid to see how repeating courses may affect financial aid eligibility.
Nothing in these procedures shall conflict with Education Code Section 76224 pertaining to the finality of grades assigned by instructors or with Title 5 or District procedures relating to retention and destruction of records.

== COURSE CATALOG ==

---
Course: ACC-1A Principles of Accounting I
Units: 3.00
Transferability: UC, CSU
C-ID: ACCT 110
Prerequisite: None.
Advisory: BUS 20
Description: An introduction to accounting principles and practice, as a manual and/or computerized information system that provides and interprets economic data for economic units within a global society. Includes recording, analyzing, and summarizing procedures used in preparing financial statements. 54.00 hours lecture. (Letter grade only)
---
Course: ACC-1B Principles of Accounting II
Units: 3.00
Transferability: UC, CSU
C-ID: ACCT 120
Prerequisite: ACC 1A
Description: A study of managerial accounting principles and information systems including basic concepts, limitations, tools and methods to support the internal decision-making functions of an organization. 54.00 hours lecture. (Letter grade only)
---
Course: ACC-19 Volunteer Income Tax Assistance Training
Units: 1.00
Prerequisite: None.
Description: The Volunteer Income Tax Assistance (VITA) program is an initiative sponsored by the Internal Revenue Service. This course is intended to provide students with the opportunity to serve qualified individuals. VITA sites offer free tax help to people who need assistance in preparing their own tax returns, including: people who generally make $57,000 or less; people with disabilities; and limited English-speaking taxpayers. Teaches students about income tax preparation, prepares students to apply for IRS VITA certification, in order to work with individuals and families with limited incomes to prepare tax returns - enabling them to receive proper tax credits and refunds. Completion of this course will allow students to volunteer, providing free, high-quality income tax service. 18.00 hours lecture. (Letter grade only)
---
Course: CIS-5 Computer Programming Concepts and Methodology I:C++
Units: 4.00
Transferability: UC, CSU
C-ID: COMP 122; ITIS 130
Prerequisite: None.
Advisory: CIS 1A
Description: Introduction to the discipline of computer science incorporating problem definitions, algorithm development, and structured programming logic for business, scientific and mathematical applications. The C++ language will be used for programming problems. 54.00 hours lecture and 54.00 hours laboratory. (TBA Option) (Same as CSC-5) (Letter grade only)
---
Course: MAT-1A Calculus I
Units: 4.00
Transferability: UC, CSU
C-ID: MATH 210; MAT 1A+MAT 1B=MATH 900S
Prerequisite: MAT 10 or MAT 23 or MAT 9 and MAT 36 or qualifying placement
Description: Functions, limits, continuity, techniques and applications of differentiation, the Fundamental Theorem of Calculus, and basic integration. 72.00 hours lecture and 18.00 hours laboratory. (Letter grade or Pass/No Pass option)
---
Course: MAT-1B Calculus II
Units: 4.00
Transferability: UC, CSU
C-ID: MATH 220; MAT 1A+MAT 1B=MATH 900S
Prerequisite: MAT 1A
Description: Techniques of integration, applications of integration, improper integrals, parametric equations, polar coordinates, infinite sequences and series. 72.00 hours lecture and 18.00 hours laboratory. (Letter grade or Pass/No Pass option)
---
Course: MAT-1C Calculus III
Units: 4.00
Transferability: UC, CSU
C-ID: MATH 230
Prerequisite: MAT 1B
Description: Vectors in a plane and in space, vector functions, calculus on functions of multiple variables, partial derivatives, multiple integrals, line and surface integrals, Green's theorem, Stokes' theorem, Divergence theorem, and elementary applications to the physical and life sciences. 72.00 hours lecture and 18.00 hours laboratory. (Letter grade or Pass/No Pass option)
---
Course: PHY-4A Mechanics
Units: 4.00
Transferability: UC, CSU
C-ID: PHYS 205; PHY 4A+PHY 4B+PHY 4C+PHY 4D=PHYS 200S (RCC and MVC only)
Prerequisite: None.
Corequisite: MAT 1A
Description: Examines vectors, particle kinematics and dynamics, work and power, conservation of energy and momentum, rotation, oscillations and gravitation. 54.00 hours lecture and 54.00 hours laboratory. (Letter grade only)
---
Course: PHY-4B Electricity and Magnetism
Units: 4.00
Transferability: UC, CSU
C-ID: PHYS 210; PHY 4A+PHY 4B+PHY 4C+PHY 4D=PHYS 200S (RCC and MVC only)
Prerequisite: PHY 4A
Corequisite: MAT 1B
Description: Study of electric fields, voltage, current, magnetic fields, electromagnetic induction, alternating currents and electromagnetic waves. 54.00 hours lecture and 54.00 hours laboratory. (Letter grade only)
---
Course: PHY-4C Heat, Light and Waves
Units: 4.00
Transferability: UC, CSU
C-ID: PHYS 215; PHY 4A+PHY 4B+PHY 4C+PHY 4D=PHYS 200S (RCC and MVC only)
Prerequisite: PHY 4A
Corequisite: MAT 1B
Description: Examines fluid mechanics; temperature, heat transfer, thermal properties of matter, laws of thermodynamics; oscillations and waves; reflection, refraction, lenses and mirrors, interference, and diffraction; introduction to special relativity and modern physics. 54.00 hours lecture and 54.00 hours laboratory. (Letter grade only)
---
Course: ENGL-C1000 Academic Reading and Writing
Units: 4.00
Transferability: UC, CSU
C-ID: ENGL 100
Prerequisite: Placement as determined by the college’s multiple measures assessment process
Description: In this course, students receive instruction in academic reading and writing, including writing processes, effective use of language, analytical thinking, and the foundations of academic research. Integrated reading and writing assignments respond to various rhetorical situations. Students will produce a minimum of 7500 words of writing, inclusive of 5000 words of assessed formal writing and 2500 words of other kinds of instructor-reviewed writing. Classroom instruction integrates writing lab activities. Students may not receive credit for both ENGL-C1000 and ENGL-C1000H. 72.00 hours lecture and 18.00 hours laboratory. (TBA Option) (Letter grade only)
---
Course: COMM-C1000 Introduction to Public Speaking
Units: 3.00
Transferability: UC, CSU
C-ID: COMM 110
Prerequisite: None.
Description: In this course, students learn and apply foundational rhetorical theories and techniques of public speaking in a multicultural democratic society. Students discover, develop, and critically analyze ideas in public discourse through research, reasoning, organization, composition, delivery to a live audience and evaluation of various types of speeches, including informative and persuasive speeches. Students will construct and present a minimum of three (3) faculty-supervised, faculty-evaluated speeches presented in front of a live (in-person or virtual) audience (one to many). Students may not receive credit for both COMM-C1000 and COMM-C1000H. 54.00 hours lecture. (Letter grade or Pass/No Pass option)
---
// [NOTE: All other courses from the provided document would be scraped and formatted in a similar manner here.]
`;