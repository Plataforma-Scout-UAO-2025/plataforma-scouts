# Introducing Bruno to Scouts Development

[Bruno](https://www.usebruno.com/) is an open-source API client that works similarly to Postman or other HTTP clients, but with some important benefits:

- **Local desktop application**: No login or account required.
- **Declarative scripting**: Easily update post-response variables using simple expressions.
- **Secure**: Collections are stored directly in your filesystem. Everything is local, and you retain full ownership of your data.

---

## ⚠️ Important Warning

Bruno automatically **writes all changes to disk** each time you save inside the Bruno app.  
Since this `bruno/` folder is part of the Git repository, any edits (e.g., changing request payloads, headers, or environments) will immediately modify the tracked files.  

- Use **caution when editing collections** to avoid committing unwanted changes.  
- Always **review diffs (`git diff`)** before pushing.  
- If experimenting, consider working on a temporary branch.  

---

## Setup

1. Install [Bruno](https://www.usebruno.com/downloads).
2. Ensure this folder exists in your project:  

./plataforma-scouts/backend/bruno

3. Launch Bruno from your computer.
4. In Bruno, go to the **Collections** section → click **Open Collection** → select the `./plataforma-scouts/backend/bruno` folder (path may vary depending on where you cloned the project).
5. Choose an **environment**:
- For now, only **Local** is available.  
- It defines a variable `baseUrl` pointing to `http://localhost:8080`.  
- To use it, reference `{{baseUrl}}` and append your URI endpoint.
6. Requests are grouped by **resource**, so each team can focus on the feature it owns. Example folder structure:

```text
bruno/
├── miembros/
│   ├── Create.bru
│   ├── Delete.bru
│   ├── Read.bru
│   ├── Update.bru
│   └── folder.bru
├── acudientes/
│   ├── Create.bru
│   ├── Delete.bru
│   ├── Read.bru
│   ├── Update.bru
│   └── folder.bru
├── environments/
│   └── Local.bru
└── bruno.json

Usage

    Open any resource folder (e.g., acudientes, miembros, usuarios) to run its requests.

    Use environments (Local, and later Staging or Production) to switch API contexts without editing individual requests.
