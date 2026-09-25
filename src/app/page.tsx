import HomePageClient from "@/components/HomePageClient";
import { listPublicProjects } from "@/services/publicProjects";
import type { ProjectRecord } from "@/services/projects";

// 每次访问首页时在服务端读取当前已启用的项目，不依赖构建期的数据快照。
export const dynamic = "force-dynamic";

export default async function Home() {
  let projects: ProjectRecord[] = [];
  let projectsError = false;

  try {
    projects = await listPublicProjects();
  } catch (error) {
    console.error("Public projects load failed:", error);
    projectsError = true;
  }

  return <HomePageClient projects={projects} projectsError={projectsError} />;
}
