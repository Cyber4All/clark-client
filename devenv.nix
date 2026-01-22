{
  pkgs,
  lib,
  config,
  inputs,
  ...
}:

{
  # https://devenv.sh/basics/
  env = {
    # Environment variables required for canvas dependency to install
    LDFLAGS = "-L${pkgs.libjpeg_original}/lib";
    CPPFLAGS = "-I${pkgs.libjpeg_original}/include";
    PKG_CONFIG_PATH = "${pkgs.libjpeg_original}/lib/pkgconfig";
  };

  # https://devenv.sh/packages/
  packages = [
    pkgs.git
    # Packages required for canvas dependency to install
    pkgs.libjpeg_original
    pkgs.cairo
    pkgs.pango
    pkgs.libpng
    pkgs.giflib
    pkgs.librsvg
    pkgs.pixman
    pkgs.jq
  ];

  # https://devenv.sh/languages/
  languages.javascript = {
    enable = true;
    npm.enable = true;
  };

  # https://devenv.sh/processes/
  # processes.dev.exec = "${lib.getExe pkgs.watchexec} -n -- ls -la";

  # https://devenv.sh/services/
  # services.postgres.enable = true;

  # https://devenv.sh/basics/
  enterShell = ''
    echo "
    Welcome to CLARK client devenv shell
    Node Version: $(node -v)
    Clark Version: $(npm version --json | jq -r '.clark')
    "
  '';

  # https://devenv.sh/tasks/
  # tasks = {
  #   "myproj:setup".exec = "mytool build";
  #   "devenv:enterShell".after = [ "myproj:setup" ];
  # };

  # https://devenv.sh/git-hooks/
  # git-hooks.hooks.shellcheck.enable = true;

  # See full reference at https://devenv.sh/reference/options/
}
