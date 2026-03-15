; Definitions

((let_func name: (identifier) @name) @definition.function)
((extern_let name: (identifier) @name) @definition.function)
((type_decl name: (type_name) @name) @definition.type)
((extern_type name: (type_name) @name) @definition.type)
((variant_ctor_decl name: (type_name) @name) @definition.enum)
((variant_ctor_nullary (type_name) @name) @definition.enum)

; References (calls / type usage)

((call_expr . (identifier) @name) @reference.call)
((call_expr . (qualified_ident) @name) @reference.call)
((call_expr . (type_name) @name) @reference.call)

((record_construct name: (type_name) @name) @reference.type)
((named_type_sig (type_name) @name) @reference.type)
((app_type_sig (type_name) @name) @reference.type)
((named_type_usage (type_name) @name) @reference.type)
((app_type_usage (type_name) @name) @reference.type)

