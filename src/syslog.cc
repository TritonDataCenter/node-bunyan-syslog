#include <errno.h>
#include <string.h>
#include <syslog.h>

#include <node.h>
#include <v8.h>
#include <nan.h>

using namespace v8;

#define RETURN_EXCEPTION(MSG)                                           \
	Nan::ThrowError(MSG)

#define RETURN_ARGS_EXCEPTION(MSG)                                      \
	Nan::ThrowError(MSG)

#define REQUIRE_ARGS(ARGS)					\
	if (ARGS.Length() == 0)					\
		RETURN_ARGS_EXCEPTION("missing arguments");

#define REQUIRE_INT_ARG(ARGS, I, VAR)                                   \
	REQUIRE_ARGS(ARGS);						\
	if (ARGS.Length() <= (I))					\
		RETURN_ARGS_EXCEPTION("argument " #I " must be an Integer"); \
	Nan::MaybeLocal<v8::Integer> _ ## VAR(Nan::To<v8::Integer>(ARGS[I])); \
	if (_ ## VAR.IsEmpty())					\
		RETURN_ARGS_EXCEPTION("argument " #I " must be an Integer"); \
	int VAR = _ ## VAR.ToLocalChecked()->Value();

#define REQUIRE_STRING_ARG(ARGS, I, VAR)				\
	REQUIRE_ARGS(ARGS);						\
	if (ARGS.Length() <= (I))					\
		RETURN_ARGS_EXCEPTION("argument " #I " must be a String"); \
	Nan::MaybeLocal<v8::String> _ ## VAR(Nan::To<v8::String>(ARGS[I])); \
	if (_ ## VAR.IsEmpty())					\
		RETURN_ARGS_EXCEPTION("argument " #I " must be a String"); \
	Nan::Utf8String VAR(_ ## VAR.ToLocalChecked());


///--- API

NAN_METHOD(Open) {
	Nan::HandleScope scope;

	REQUIRE_STRING_ARG(info, 0, ident);
	REQUIRE_INT_ARG(info, 1, logopt);
	REQUIRE_INT_ARG(info, 2, facility);

	openlog(strdup(*ident), logopt, facility);

	return;
}

NAN_METHOD(Log) {
	Nan::HandleScope scope;

	REQUIRE_INT_ARG(info, 0, priority);
	REQUIRE_STRING_ARG(info, 1, message);

	syslog(priority, "%s", *message);

	return;
}

NAN_METHOD(Close) {
	Nan::HandleScope scope;

	closelog();

	return;
}

NAN_METHOD(Mask) {
	Nan::EscapableHandleScope scope;

	REQUIRE_INT_ARG(info, 0, maskpri);

	int mask = setlogmask(LOG_UPTO(maskpri));

	info.GetReturnValue().Set(scope.Escape(Nan::New<Integer>(mask)));
}

NAN_MODULE_INIT(init) {
	Nan::SetMethod(target, "openlog", Open);
	Nan::SetMethod(target, "syslog", Log);
	Nan::SetMethod(target, "closelog", Close);
	Nan::SetMethod(target, "setlogmask", Mask);

	NODE_DEFINE_CONSTANT(target, LOG_EMERG);
	NODE_DEFINE_CONSTANT(target, LOG_ALERT);
	NODE_DEFINE_CONSTANT(target, LOG_ERR);
	NODE_DEFINE_CONSTANT(target, LOG_WARNING);
	NODE_DEFINE_CONSTANT(target, LOG_NOTICE);
	NODE_DEFINE_CONSTANT(target, LOG_INFO);
	NODE_DEFINE_CONSTANT(target, LOG_DEBUG);

	NODE_DEFINE_CONSTANT(target, LOG_KERN);
	NODE_DEFINE_CONSTANT(target, LOG_USER);
	NODE_DEFINE_CONSTANT(target, LOG_MAIL);
	NODE_DEFINE_CONSTANT(target, LOG_DAEMON);
	NODE_DEFINE_CONSTANT(target, LOG_AUTH);
	NODE_DEFINE_CONSTANT(target, LOG_LPR);
	NODE_DEFINE_CONSTANT(target, LOG_NEWS);
	NODE_DEFINE_CONSTANT(target, LOG_UUCP);
	NODE_DEFINE_CONSTANT(target, LOG_CRON);
	NODE_DEFINE_CONSTANT(target, LOG_LOCAL0);
	NODE_DEFINE_CONSTANT(target, LOG_LOCAL1);
	NODE_DEFINE_CONSTANT(target, LOG_LOCAL2);
	NODE_DEFINE_CONSTANT(target, LOG_LOCAL3);
	NODE_DEFINE_CONSTANT(target, LOG_LOCAL4);
	NODE_DEFINE_CONSTANT(target, LOG_LOCAL5);
	NODE_DEFINE_CONSTANT(target, LOG_LOCAL6);
	NODE_DEFINE_CONSTANT(target, LOG_LOCAL7);

	NODE_DEFINE_CONSTANT(target, LOG_PID);
	NODE_DEFINE_CONSTANT(target, LOG_CONS);
	NODE_DEFINE_CONSTANT(target, LOG_NDELAY);
}

NODE_MODULE(syslog, init);
