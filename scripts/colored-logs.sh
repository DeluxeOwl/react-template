set -o errexit
set -o nounset
set -o pipefail
if [[ "${TRACE-0}" == "1" ]]; then
    set -o xtrace
fi

# Define Color Codes
# Format: \033[Background;Foreground m
BG_RED='\033[41;97m'     # Red BG, White Text
BG_YELLOW='\033[43;30m'  # Yellow BG, Black Text (better readability)
BG_BLUE='\033[44;97m'    # Blue BG, White Text
BG_GREY='\033[100;97m'   # Dark Grey BG, White Text (Light grey is 100)
RESET='\033[0m'

# Logger Functions
log_error()   { echo -e "${BG_RED} ERROR ${RESET} $1"; }
log_warning() { echo -e "${BG_YELLOW} WARN ${RESET}  $1"; }
log_info()    { echo -e "${BG_BLUE} INFO ${RESET}  $1"; }
log_debug()   { echo -e "${BG_GREY} DEBUG ${RESET} $1"; }