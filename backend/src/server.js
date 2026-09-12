import app from "./app.js";
import { env } from "./config/env.js";
app.listen(env.PORT, () => console.log(`സമയമുണ്ട് backend running at http://localhost:${env.PORT}`));
