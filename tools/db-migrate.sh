#!/bin/bash

. activate.sh "${1}"

echo

if [ ! -n "${SMAPENV}" ]; then
    echo -e "\t- ** FATAL: You must provide a valid env name ('dev', 'stage', etc.).\n"
    exit 1
fi

echo ""
echo -e "\t- Set env to \"${SMAPENV}\"."

if [ ! -n "${2}" ]; then
    echo -e "\t- ** FATAL: No up/dn parameter given.\n"
    exit 1
fi

case "${2}" in

"up"|"dn")
    echo -e "\t- Setting migration direction to \"${2}\"."
    mdir="${2}"
    ;;
*)
    echo -e "\t** FATAL: Up/dn parameter \"${2}\" invalid.\n"
    exit 1
    ;;
esac

if [ "${mdir}" == "up" ]; then
    STARTIDX="00"
    STOPIDX="ZZ"
elif [ "${mdir}" == "dn" ]; then
    STARTIDX="ZZ"
    STOPIDX="00"
fi

if [ -n "${3}" ]; then
    case "${mdir}" in
        "up")
            STARTIDX="${3}"
            STOPIDX="ZZZ"
            ;;
        "dn")
            STOPIDX="${3}"
            STARTIDX="ZZZ"
            ;;
    esac
    echo -e "\t- Set start idx = \"${STARTIDX}\", stop idx = \"${STOPIDX}\"."
fi

SMAP_ROOTDIR=$(dirname $(dirname $(readlink -f "${0}")))
SMAP_DATADIR="${SMAP_ROOTDIR}/db/data/"
SMAP_SCHEMADIR="${SMAP_ROOTDIR}/db/schema/"

if [ "${mdir}" = "dn" ]; then
    sortcmd="sort -r"
else
    sortcmd="sort"
fi

# set postgresql creds (from env/<env>)
PGUSER="${SMAP_DBUSER}"
PGPASSWORD="${SMAP_DBPASS}"
PGHOST="${SMAP_DBHOST}"
PGDATABASE="${SMAP_DB}"

export PGUSER PGPASSWORD PGHOST PGDATABASE

SCHEMAFILES=$(find "${SMAP_SCHEMADIR}" -name "*.${mdir}.sql" | $sortcmd) 

DATESTR=`date "+%Y%m%d.%H%M%S"`
DBOUTPUT="db-migrate.${DATESTR}.${mdir}.out"
DUMPOUTPUT="${DATESTR}.${mdir}.dump"

echo -e "\t- Backing up current schema and data..."
pg_dump > "${DUMPOUTPUT}"
echo -e "\t\t- done."

for sfile in ${SCHEMAFILES[@]}
do
    sfilebase=`basename ${sfile}`
    if [ "${mdir}" == "up" ]; then
        if [ "${sfilebase}" \< "${STARTIDX}" ]; then
            echo -e "\t- Skipping ${sfilebase}."
            continue
        fi
    elif [ "${mdir}" == "dn" ]; then
        if [ "${sfilebase}" \< "${STOPIDX}" ]; then
            echo -e "\t- Skipping ${sfilebase}."
            continue
        fi
    else
        echo -e "\t- FATAL: Migration direction is borked."
        exit 1
    fi
    echo -e "\t- Executing schema sql: ${sfilebase}"
    psql --echo-all < "${sfile}" &>> "${DBOUTPUT}"
    if [ -f "${SMAP_DATADIR}${sfilebase}" ]; then
        echo -e "\t\t- Executing data sql: ${sfilebase}"
        psql --echo-all < "${SMAP_DATADIR}${sfilebase}" &>> "${DBOUTPUT}"
    fi
    # todo: FIXTURES
    echo -e "\t\t- ...${sfilebase} done."
done

PGUSER=""
PGPASSWORD=""
export PGUSER PGPASSWORD
echo
