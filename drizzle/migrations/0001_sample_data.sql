do $$ declare sid uuid; begin
  select id into sid from public.students where email = 'priya@student.edu';
  if sid is null then return; end if;
  insert into public.skills (student_id,name,category,proficiency,progress) values
    (sid,'Python','Programming','Intermediate',70),(sid,'React','Web Development','Beginner',45),
    (sid,'SQL','Database','Advanced',80),(sid,'Communication','Soft Skills','Advanced',85);
  insert into public.certificates (student_id,name,organization,issue_date,credential_id,url) values
    (sid,'Python for Everybody','Coursera','2026-03-12','PY-48213','https://coursera.org'),
    (sid,'SQL Basics','HackerRank','2026-05-02','HR-9921',null);
  insert into public.internships (student_id,company,role,start_date,end_date,internship_type,status,description) values
    (sid,'TechNova Solutions','Web Developer Intern','2026-06-01','2026-07-31','Remote','Completed','Built responsive pages with React.');
  insert into public.applications (student_id,company,role,applied_date,status) values
    (sid,'Infosys','Data Analyst Intern','2026-08-10','Interview'),
    (sid,'TCS','Software Intern','2026-08-20','Applied');
end $$;