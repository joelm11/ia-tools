### Running Backend

1. `cd src/backend`
2. `brew services start redis`
3. `npx ts-node ./src/jobs/iamf_jobs.ts`
4. `npx ts-node ./index.ts`
5. `brew services stop redis`
