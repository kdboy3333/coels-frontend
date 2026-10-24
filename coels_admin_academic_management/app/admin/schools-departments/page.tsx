import Header from "../../components/Header";
import Footer from "../../components/Footer";
import SectionTitle from "../../components/SectionTitle";
import SchoolDepartmentManagement from "./SchoolDepartmentManagement";
export default function SchoolsDepartmentsPage(){return <><Header/><main><section className="bg-[#102A43] px-5 py-20"><SectionTitle eyebrow="Academic Structure" title="Schools & Departments" description="Manage schools and place departments under the correct programme and school."/></section><section className="mx-auto max-w-7xl px-5 py-16"><SchoolDepartmentManagement/></section></main><Footer/></>}
