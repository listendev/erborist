#!/usr/bin/env bash

set +x

POSITIONAL_ARGS=()
OPT_DRYRUN="false"
OPT_PATH=""

while [[ $# -gt 0 ]]; do
  case "$1" in
    --dry-run)
        if [ -z "$2" ]; then
            echo "Y"
            OPT_DRYRUN="true"
            shift
            break
        fi
        OPT_DRYRUN="$2"
        shift
        shift
        ;;
    --path)
        OPT_PATH="$2"
        shift
        shift
        ;;
    --*|-*)
        echo "Unknown options" 1>&2
        exit 1
        ;;
    *)
        POSITIONAL_ARGS+=("$1")
        shift
        ;;
  esac
done

if [[ -n $1 ]]; then
    echo "Last line of file specified as non-opt/last argument:"
    tail -1 "$1"
fi

set -- "${POSITIONAL_ARGS[@]}"

if [[ ! -f "$OPT_PATH" ]]
then
    echo "File \"$OPT_PATH\" does not exist" 1>&2
    exit 1
fi

OPT_DIR=$(basename "$(dirname "$OPT_PATH")")

OS=
ARCH=
IFS='_' read -ra PARTS <<< "$OPT_DIR"
for i in "${!PARTS[@]}"; do
  case "$i" in
    0)
        ;;
    1)
        OS="${PARTS[$i]}"
        ;;
    2)
        ARCH="${PARTS[$i]}"
        ;;
    3)
        ARCH+="_${PARTS[$i]}"
        ;;
    *)
        echo "Wrong number of components" 1>&2
        exit 1
        ;;
    esac
done

case "$OS" in
    darwin)
        CMD="quill sign ${OPT_PATH} --ad-hoc=true -vv"
        if [[ ${OPT_DRYRUN} == "true" ]]; then
            echo "$CMD"
            exit 0
        fi
        $CMD
        ;;
    windows)
        echo "Unsupported"
        ;;
    linux)
        echo "Unsupported"
        ;;
    *)
        echo "Missing OS" 1>&2
        exit 1
    ;;
esac
