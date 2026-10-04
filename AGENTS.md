<!-- LOVABLE:BEGIN -->
> [!IMPORTANT]
> This project is connected to [Lovable](https://lovable.dev). Avoid rewriting
> published git history — force pushing, or rebasing/amending/squashing commits
> that are already pushed — as it rewrites history on Lovable's side and the
> user will likely lose their project history.
>
> Commits you push to the connected branch sync back to Lovable and show up in
> the editor, so keep the branch in a working state.
<!-- LOVABLE:END -->

- Student data CRUD runs from the browser client with RLS (student_id = auth.uid(), admins read all via has_role); keep authorization in RLS policies, not UI only.
- Roles live in public.user_roles; route guard in _authenticated/route.tsx exposes isAdmin, admin pages use lib/admin-guard requireAdmin.
- Record pages reuse components/ResourcePage ResourceManager; add new record types by config, not new CRUD code.
