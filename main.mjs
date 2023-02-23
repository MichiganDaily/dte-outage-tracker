import { writeFileSync, readFileSync, existsSync } from "fs";
import { csvFormat, csvParse } from "d3-dsv";

const main = async () => {
  const req = await fetch("https://kubra.io/stormcenter/api/v1/stormcenters/4fbb3ad3-e01d-4d71-9575-d453769c1171/views/8ed2824a-bd92-474e-a7c4-848b812b7f9b/currentState?preview=false");
  const res = await req.json();

  const request = await fetch(`https://kubra.io/${res.data.interval_generation_data}/public/thematic-2/thematic_areas.json`);
  const response = await request.json();

  const now = response.file_data.map(d => ({
    timestamp: new Date().toISOString(),
    zipcode: d.title,
    number_outages: d.desc.n_out,
    customers_served: d.desc.cust_s,
    customers_affected: d.desc.cust_a.val,
    percent_affected: d.desc.percent_cust_a.val
  }));

  writeFileSync("./data.csv", csvFormat(now));

  if (existsSync("./history.csv")) {
    const history = csvParse(readFileSync("./history.csv").toString());
    const data = [...history, ...now];
    writeFileSync("./history.csv", csvFormat(data));
  } else {
    writeFileSync("./history.csv", csvFormat(now));
  }

  console.log(res.data.interval_generation_data, now.reduce((acc, d) => acc + d.customers_affected, 0))
}

main();