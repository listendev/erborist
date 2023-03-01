package main

import (
	"fmt"
	"os"
	"os/exec"
	"path/filepath"
	"regexp"
	"strings"

	"github.com/Masterminds/semver"
	"golang.org/x/exp/maps"
)

var (
	commands = map[string]func([]string) error{
		"clean": func(args []string) error {
			fmt.Fprintf(os.Stdout, "executing `%s` ...\n", args[0])
			// TODO
			return nil
		},
		"tag": func(args []string) error {
			// Check we have a version argument
			if len(args) < 2 {
				fmt.Fprintf(os.Stderr, "missing the version argument ...\n")
				os.Exit(1)
			}
			// Check the tag argument is semver
			v := strings.TrimPrefix(args[1], "v")
			if _, err := semver.NewVersion(v); err != nil {
				fmt.Fprintf(os.Stderr, "%s is not a valid semantic version.\n", v)
				os.Exit(1)
			}

			fmt.Fprintf(os.Stdout, "writing version `%s` in package.json\n", v)

			if err := updateVersion(v); err != nil {
				fmt.Fprintf(os.Stderr, "could not update the version in the package.json file.\n")
				os.Exit(1)
			}

			if err := run("git", "add", "package.json"); err != nil {
				fmt.Fprintf(os.Stderr, "could not add package.json to the git index.\n")
				os.Exit(1)
			}

			if err := run("git", "commit", "-m", fmt.Sprintf("build: update version to %s", v)); err != nil {
				fmt.Fprintf(os.Stderr, "could not commit package.json version changes.\n")
				os.Exit(1)
			}

			if !strings.HasPrefix(v, "v") {
				v = fmt.Sprintf("v%s", v)
			}

			fmt.Fprintf(os.Stdout, "executing `%s` with version `%s` ...\n", args[0], v)

			return run("git", "tag", "-a", v, "-m", fmt.Sprintf("Release %s", v), "main")
		},
	}
)

func replaceAllStringSubmatchFunc(re *regexp.Regexp, str string, repl func([]string) string) string {
	result := ""
	lastIndex := 0

	for _, v := range re.FindAllSubmatchIndex([]byte(str), -1) {
		groups := []string{}
		for i := 0; i < len(v); i += 2 {
			groups = append(groups, str[v[i]:v[i+1]])
		}

		result += str[lastIndex:v[0]] + repl(groups)
		lastIndex = v[1]
	}

	return result + str[lastIndex:]
}

func updateVersion(v string) error {
	packageJSONPath := "package.json"
	content, err := os.ReadFile(packageJSONPath)
	if err != nil {
		return err
	}

	reg, err := regexp.Compile(`("version":\s*)"(.*)"`)
	if err != nil {
		return err
	}

	res := replaceAllStringSubmatchFunc(reg, string(content), func(groups []string) string {
		return groups[1] + `"` + v + `"`
	})

	if err := os.WriteFile(packageJSONPath, []byte(res), 0o644); err != nil {
		return err
	}

	return nil
}

func run(args ...string) error {
	exe, err := exec.LookPath(args[0])
	if err != nil {
		return err
	}
	setX(args...)
	cmd := exec.Command(exe, args[1:]...)
	cmd.Stdout = os.Stdout
	cmd.Stderr = os.Stderr

	return cmd.Run()
}

func setX(args ...string) {
	// Escape special chars
	fmtArgs := make([]string, len(args))
	for i, arg := range args {
		if strings.ContainsAny(arg, " \t'\"") {
			fmtArgs[i] = fmt.Sprintf("%q", arg)
		} else {
			fmtArgs[i] = arg
		}
	}

	fmt.Fprintf(os.Stderr, "+ %s\n", strings.Join(fmtArgs, " "))
}

func main() {
	// Check this tool is run from the root directory
	src, err := os.Executable()
	if err != nil {
		os.Exit(1)
	}
	cwd, err := os.Getwd()
	if err != nil {
		os.Exit(1)
	}
	if cwd == filepath.Dir(src) {
		fmt.Fprintln(os.Stderr, "this tool must be run from another directory")
		os.Exit(1)
	}

	// Construct the arguments and the environment variables
	args := os.Args[1:]
	for i, arg := range os.Args[1:] {
		if idx := strings.IndexRune(arg, '='); idx >= 0 {
			// It's an environment variable
			os.Setenv(arg[:idx], arg[idx+1:])
			args = append(args[:i], args[i+1:]...)
		}
	}

	if len(args) < 1 {
		fmt.Fprintf(os.Stderr, "specify one command in %s.\n", maps.Keys(commands))
		os.Exit(1)
	}

	norm := filepath.ToSlash(args[0])
	c := commands[norm]
	if c == nil {
		fmt.Fprintf(os.Stderr, "unknown command `%s`.\n", norm)
		os.Exit(1)
	}

	if err := c(args); err != nil {
		fmt.Fprintf(os.Stderr, "failure while executing `%s`.\n", norm)
		os.Exit(1)
	}
}
