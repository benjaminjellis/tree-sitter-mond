/// <reference types="tree-sitter-cli/dsl" />
// @ts-check

module.exports = grammar({
  name: "mond",

  word: $ => $.identifier,

  extras: $ => [/\s+/, $.comment],

  conflicts: $ => [
    [$.app_type_sig, $.named_type_sig],
    [$.app_type_usage, $.named_type_usage],
  ],

  rules: {
    source_file: $ => repeat($._declaration),

    comment: $ => token(seq(";;", /.*/)),

    // ── Top-level declarations ────────────────────────────────────────────────

    _declaration: $ => choice(
      $.let_func,
      $.type_decl,
      $.extern_let,
      $.extern_type,
      $.use_decl,
      $.test_decl,
    ),

    // (pub? let name {params...} body...)
    // Multiple body expressions are valid — they desugar to nested LetLocal "_" (sequencing)
    let_func: $ => seq(
      "(",
      optional($.pub_kw),
      "let",
      field("name", $.identifier),
      $.param_list,
      repeat1($._expr),
      ")",
    ),

    pub_kw: _ => "pub",

    param_list: $ => seq("{", repeat($.identifier), "}"),

    // ── Type declarations ─────────────────────────────────────────────────────

    type_decl: $ => seq(
      "(",
      optional($.pub_kw),
      "type",
      optional($.type_params),
      field("name", $.type_name),
      $._type_body,
      ")",
    ),

    type_params: $ => seq("[", repeat1($.type_var), "]"),

    // Record:  [(:field1 ~ Type) (:field2 ~ Type)]
    // Variant: [Ctor2 (Ctor1 ~ Type)]
    _type_body: $ => seq("[", repeat($._type_member), "]"),

    _type_member: $ => choice(
      $.record_field_decl,
      $.variant_ctor_decl,
      $.variant_ctor_nullary,
    ),

    record_field_decl: $ => seq("(", field("name", $.field_name), "~", $._type_usage, ")"),

    variant_ctor_decl: $ => seq("(", field("name", $.type_name), "~", $._type_usage, ")"),

    variant_ctor_nullary: $ => $.type_name,

    // ── Extern declarations ───────────────────────────────────────────────────

    // (pub? extern let name ~ TypeSig module/fn)
    extern_let: $ => seq(
      "(",
      optional($.pub_kw),
      "extern",
      "let",
      field("name", $.identifier),
      "~",
      $._type_sig,
      $.qualified_ident,
      ")",
    ),

    // (pub? extern type ['k 'v]? Name [module/type])
    extern_type: $ => seq(
      "(",
      optional($.pub_kw),
      "extern",
      "type",
      optional($.type_params),
      field("name", $.type_name),
      optional($.qualified_ident),
      ")",
    ),

    // ── Use declarations ──────────────────────────────────────────────────────

    // (pub? use module) or (pub? use namespace/module)
    use_decl: $ => seq(
      "(",
      optional($.pub_kw),
      "use",
      choice($.qualified_ident, $.identifier),
      optional($.use_items),
      ")",
    ),

    // (test "name" body)
    test_decl: $ => seq(
      "(",
      "test",
      field("name", $.string_lit),
      field("body", $._expr),
      ")",
    ),

    use_items: $ => seq(
      "[",
      repeat1(choice($.identifier, $.type_name, $.wildcard_import)),
      "]",
    ),

    wildcard_import: _ => "*",

    // ── Expressions ──────────────────────────────────────────────────────────

    _expr: $ => choice(
      $.literal,
      $.list_lit,
      $.unit_expr,
      $.identifier,
      $.type_name,
      $.qualified_ident,
      $.let_local,
      $.let_question,
      $.if_expr,
      $.do_expr,
      $.match_expr,
      $.lambda,
      $.field_access,
      $.record_construct,
      $.record_update,
      $.pipeline_expr,
      $.call_expr,
    ),

    // (let [x 1  y 2] body...)
    // Multiple body expressions are valid — same desugaring as let_func
    let_local: $ => seq(
      "(",
      "let",
      $.binding_list,
      repeat1($._expr),
      ")",
    ),

    // (let? [x expr ...] body...)
    let_question: $ => seq(
      "(",
      "let?",
      $.binding_list,
      repeat1($._expr),
      ")",
    ),

    binding_list: $ => seq("[", repeat(seq($.identifier, $._expr)), "]"),

    unit_expr: _ => seq("(", ")"),

    // (if cond then else)
    if_expr: $ => seq("(", "if", $._expr, $._expr, $._expr, ")"),

    // (do expr...)
    do_expr: $ => seq("(", "do", repeat1($._expr), ")"),

    // (with record :field1 value1 ...)
    record_update: $ => seq("(", "with", $._expr, repeat1(seq($.field_name, $._expr)), ")"),

    // (match target... arm...)
    match_expr: $ => seq(
      "(",
      "match",
      $.match_targets,
      repeat1($.match_arm),
      ")",
    ),

    match_targets: $ => prec.right(repeat1(choice($.identifier, $.qualified_ident))),

    match_arm: $ => seq($.pattern_tuple, repeat(seq("|", $.pattern_tuple)), "~>", $._expr),

    pattern_tuple: $ => repeat1($._pattern),

    // (f {params} -> body)
    lambda: $ => seq("(", "f", $.param_list, "->", $._expr, ")"),

    // (:field record)
    field_access: $ => seq("(", $.field_name, $._expr, ")"),

    // (TypeName :f1 v1 :f2 v2)
    record_construct: $ => prec(1, seq(
      "(",
      field("name", $.type_name),
      repeat1(seq($.field_name, $._expr)),
      ")",
    )),

    // (|> value step1 step2 ...)
    pipeline_expr: $ => prec(2, seq(
      "(",
      "|>",
      $._expr,
      repeat1($._expr),
      ")",
    )),

    // (f arg...)  or  (module/fn arg...)
    call_expr: $ => seq("(", $._expr, repeat($._expr), ")"),

    // ── Patterns ─────────────────────────────────────────────────────────────

    _pattern: $ => choice(
      $.wildcard_pat,
      $.var_pat,
      $.literal_pat,
      $.list_pat,
      $.constructor_pat,
    ),

    wildcard_pat: _ => "_",

    // Lowercase ident → variable binding
    var_pat: $ => $.identifier,

    literal_pat: $ => $.literal,

    // (Ctor pat...) or bare Ctor
    constructor_pat: $ => choice(
      seq("(", $.type_name, repeat($._pattern), ")"),
      seq("(", $.type_name, repeat1(seq($.field_name, $._pattern)), ")"),
      $.type_name,
    ),

    list_pat: $ => choice(
      "[]",
      seq("[", $._pattern, "|", $._pattern, "]"),
      seq("[", repeat1($._pattern), "]"),
    ),

    // ── Type signatures (in extern let) ──────────────────────────────────────

    _type_sig: $ => choice(
      $.fun_type_sig,
      $.app_type_sig,
      $.named_type_sig,
      $.generic_type_sig,
      $.parenthesized_type_sig,
    ),

    // (A -> B)
    fun_type_sig: $ => seq("(", $._type_sig, "->", $._type_sig, ")"),

    // Option 'a  /  Result 'e 'a
    app_type_sig: $ => prec.right(seq($.type_name, repeat1($._type_sig))),

    named_type_sig: $ => $.type_name,

    generic_type_sig: $ => $.type_var,

    // (Option (Selector 'm))
    parenthesized_type_sig: $ => seq(
      "(",
      choice($.app_type_sig, $.named_type_sig, $.generic_type_sig),
      ")",
    ),

    // ── Type usages (in type declarations) ───────────────────────────────────

    _type_usage: $ => choice(
      $.fun_type_usage,
      $.app_type_usage,
      $.named_type_usage,
      $.type_var,
      $.parenthesized_type_usage,
    ),

    // (A -> B)
    fun_type_usage: $ => seq("(", $._type_usage, "->", $._type_usage, ")"),

    // (Selector 'm), (Option (Selector 'm))
    parenthesized_type_usage: $ => seq(
      "(",
      choice($.app_type_usage, $.named_type_usage, $.type_var),
      ")",
    ),

    app_type_usage: $ => prec.right(seq($.type_name, repeat1($._type_usage))),

    named_type_usage: $ => $.type_name,

    // ── Terminals ─────────────────────────────────────────────────────────────

    literal: $ => choice(
      $.float,
      $.integer,
      $.boolean,
      $.string_lit,
    ),

    list_lit: $ => seq("[", repeat($._expr), "]"),

    // float before integer so 3.14 doesn't lex as int 3 + operator .14
    float: _ => token(/-?[0-9](?:_?[0-9])*\.[0-9](?:_?[0-9])*/),

    integer: _ => token(/-?[0-9](?:_?[0-9])*/),

    boolean: _ => token(choice("True", "False")),

    string_lit: _ => token(/"([^"\\]|\\.)*"/),

    // Operators like +, -, *, /, =, <, >, <=, >=, !=, +., -., *., /.
    operator: _ => token(/[\+\-\*\/=<>!&|\.]+/),

    // type variable: 'a 'b 'result
    type_var: _ => token(/'[a-z][a-zA-Z0-9_]*/),

    // :fieldName
    field_name: _ => token(/:[a-zA-Z_][a-zA-Z0-9_]*/),

    // module/function
    qualified_ident: _ => token(/[a-z][a-zA-Z0-9_]*\/[a-zA-Z_][a-zA-Z0-9_]*/),

    // UpperCase names: types, constructors
    type_name: _ => token(/[A-Z][a-zA-Z0-9_]*/),

    // lowercase names plus symbolic operator names (+, +., =, and, or ...)
    identifier: _ => token(choice(
      /[a-z_][a-zA-Z0-9_?]*/,
      /[\+\-\*\/=<>!&|\.]+/,
    )),
  },
});
