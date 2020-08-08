import react from "react";
import Header from "./Header";
import Sidebar from "./Sidebar";
import SubHeader from "./SubHeader";

const Layout = ({ children }) => {
	return (
		<>
			<Header />
			<div class='container-fluid'>
				<div class='row'>
					<Sidebar />
					<main class='col-md-9 ml-sm-auto col-lg-10 px-md-4'>
						<SubHeader />
						<h2>Section title</h2>
					</main>
				</div>
			</div>
		</>
	);
};

export default Layout;
