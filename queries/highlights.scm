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

; Use declarations
(use_decl (qualified_ident) @module)
(use_decl (identifier) @module)
(use_items (identifier) @module)
(wildcard_import) @operator

; Declarations — function names
((let_func name: (identifier) @function)
  (#set! "priority" 130))
((extern_let name: (identifier) @function)
  (#set! "priority" 130))

; Parameters
((let_func (param_list (identifier) @variable.parameter))
  (#set! "priority" 140))
((lambda (param_list (identifier) @variable.parameter))
  (#set! "priority" 140))
((match_expr
   (match_targets (identifier) @variable.parameter))
  (#has-ancestor? @variable.parameter let_func)
  (#set! "priority" 141))
((match_arm
   (identifier) @variable.parameter)
  (#has-ancestor? @variable.parameter let_func)
  (#set! "priority" 141))
((call_expr
   .
   (type_name)
   (identifier) @variable.parameter)
  (#has-ancestor? @variable.parameter let_func)
  (#set! "priority" 141))

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
((call_expr . (identifier) @function.call)
  (#set! "priority" 125))
((call_expr . (qualified_ident) @function.call)
  (#set! "priority" 125))
((call_expr . (type_name) @constructor)
  (#set! "priority" 126))

; Record construction
(record_construct name: (type_name) @type)
(record_construct (field_name) @property)
(record_update (field_name) @property)
((record_construct
   (field_name)
   (identifier) @variable.parameter)
  (#set! "priority" 141))
((record_update
   (field_name)
   (identifier) @variable.parameter)
  (#set! "priority" 141))

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
((qualified_ident) @variable
  (#set! "priority" 10))

; Plain identifiers (variables, function refs)
((identifier) @variable
  (#set! "priority" 10))

; Comments
(comment) @comment

; Brackets
"(" @punctuation.bracket
")" @punctuation.bracket
"{" @punctuation.bracket
"}" @punctuation.bracket
"[" @punctuation.bracket
"]" @punctuation.bracket
