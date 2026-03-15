; Scope boundaries

(source_file) @local.scope
(let_func) @local.scope
(let_local) @local.scope
(let_question) @local.scope
(lambda) @local.scope
(match_arm) @local.scope

; Local definitions

(let_func (param_list (identifier) @local.definition))
(lambda (param_list (identifier) @local.definition))
(binding_list (identifier) @local.definition)
(var_pat (identifier) @local.definition)

; Local references

(identifier) @local.reference

