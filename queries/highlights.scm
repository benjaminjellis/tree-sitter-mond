; Keywords (anonymous nodes)
"let" @keyword
"let?" @keyword
"type" @keyword
"if" @keyword
"match" @keyword
"f" @keyword
"do" @keyword
"extern" @keyword
"use" @keyword
"test" @keyword
"with" @keyword
"or" @keyword.operator
"~>" @keyword.operator
"->" @keyword.operator
"~" @punctuation.delimiter

; named keyword nodes
(pub_kw) @keyword.modifier

; Operators encoded as identifiers
((identifier) @keyword.operator
  (#eq? @keyword.operator "and"))

; Declarations — function names
(let_func name: (identifier) @function)
(extern_let name: (identifier) @function)

; Parameters
((let_func (param_list (identifier) @variable.parameter))
  (#set! "priority" 120))
((lambda (param_list (identifier) @variable.parameter))
  (#set! "priority" 120))
((match_expr
   (match_targets (identifier) @variable.parameter))
  (#has-ancestor? @variable.parameter let_func)
  (#set! "priority" 121))
((match_arm
   (identifier) @variable.parameter)
  (#has-ancestor? @variable.parameter let_func)
  (#set! "priority" 121))
((call_expr
   .
   (type_name)
   (identifier) @variable.parameter)
  (#has-ancestor? @variable.parameter let_func)
  (#set! "priority" 121))

; Type declarations
(type_decl name: (type_name) @type)
(extern_type name: (type_name) @type)
(variant_ctor_decl name: (type_name) @constructor)
(variant_ctor_nullary (type_name) @constructor)
(record_field_decl name: (field_name) @property)

; Type usage
(named_type_sig (type_name) @type)
(app_type_sig (type_name) @type)
(named_type_usage (type_name) @type)
(app_type_usage (type_name) @type)

; Pipeline
(pipeline_expr "|>" @keyword.operator)

; Call expressions — highlight the function being called
(call_expr . (identifier) @function.call)
(call_expr . (qualified_ident) @function.call)

; Record construction
(record_construct name: (type_name) @constructor)
(record_construct (field_name) @property)
(record_update (field_name) @property)
((record_construct
   (field_name)
   (identifier) @variable.parameter)
  (#set! "priority" 121))
((record_update
   (field_name)
   (identifier) @variable.parameter)
  (#set! "priority" 121))

; Field access
(field_access (field_name) @property)

; Patterns
(constructor_pat (type_name) @constructor)
(wildcard_pat) @variable.builtin
(var_pat (identifier) @variable)

; Literals
(integer) @number
(float) @number.float
(boolean) @boolean
(string_lit) @string

; Type variables  e.g. 'a 'b
(type_var) @type.parameter

; Qualified identifiers in expressions default to variable-like refs
(qualified_ident) @variable

; Plain identifiers (variables, function refs)
(identifier) @variable

; Use declarations
(use_decl (qualified_ident) @module)
(use_decl (identifier) @module)
(use_items (identifier) @module)
(wildcard_import) @operator

; Comments
(comment) @comment

; Brackets
"(" @punctuation.bracket
")" @punctuation.bracket
"{" @punctuation.bracket
"}" @punctuation.bracket
"[" @punctuation.bracket
"]" @punctuation.bracket
