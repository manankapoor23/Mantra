import { Command } from "commander";

const program = new Command();

program
  .name("mantra")
  .description("Analyze MCP tool metadata for tool-influence risks")
  .version("0.1.0");

// The `analyze` command gets wired up in M5. For now this stub just gives us
// a working `mantra --help` and `mantra --version`.
program.parse();
