export type SidebarItem = {
	item: SidebarMenuItem, 
	pageName: string, 
	setPageName: React.Dispatch<React.SetStateAction<string>> 
};

export type SidebarMenuItem = {
	icon: string;
	label: string;
	route: string;
};
  