require "json"

package = JSON.parse(File.read(File.join(__dir__, "package.json")))

Pod::Spec.new do |s|
  s.name         = "react-native-duo-layout"
  s.version      = package["version"]
  s.summary      = package["description"]
  s.homepage     = package["homepage"]
  s.license      = package["license"]
  s.authors      = package["author"]

  s.platforms    = { :ios => min_ios_version_supported }
  s.source       = { :git => package["repository"]["url"], :tag => s.version.to_s }

  # The hinge module (useHinge). The rest of the library is JavaScript only.
  s.source_files = "ios/**/*.{h,m,swift}"
  s.swift_version = "5.0"

  install_modules_dependencies(s)
end
