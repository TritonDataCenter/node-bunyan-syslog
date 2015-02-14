#include <errno.h>
#include <string.h>
#include <syslog.h>

#include <node.h>
#include <v8.h>
#include <nan.h>

using namespace v8;

#define RETURN_EXCEPTION(MSG)                                           \
	NanThrowError(MSG)

#define RETURN_ARGS_EXCEPTION(MSG)                                      \
	NanThrowError(MSG)

#define RETURN_ERRNO_EXCEPTION(RC, API, MSG)				\
	NanThrowError(node::ErrnoException(RC, API, MSG))

#define RETURN_OOM_EXCEPTION()						\
	RETURN_ERRNO_EXCEPTION(ENOMEM, "malloc", strerror(ENOMEM))

#define REQUIRE_ARGS(ARGS)					\
	if (ARGS.Length() == 0)					\
		RETURN_ARGS_EXCEPTION("missing arguments");

#define REQUIRE_INT_ARG(ARGS, I, VAR)                                   \
	REQUIRE_ARGS(ARGS);						\
	if (ARGS.Length() <= (I) || !ARGS[I]->IsNumber())		\
		RETURN_ARGS_EXCEPTION("argument " #I " must be an Integer"); \
	Local<Integer> _ ## VAR(ARGS[I]->ToInteger());			\
	int VAR = _ ## VAR->Value();

#define REQUIRE_STRING_ARG(ARGS, I, VAR)				\
	REQUIRE_ARGS(ARGS);						\
	if (ARGS.Length() <= (I) || !ARGS[I]->IsString())		\
		RETURN_ARGS_EXCEPTION("argument " #I " must be a String"); \
	String::Utf8Value VAR(ARGS[I]->ToString());

#define REQUIRE_FUNCTION_ARG(ARGS, I, VAR)                              \
	REQUIRE_ARGS(ARGS);						\
	if (ARGS.Length() <= (I) || !ARGS[I]->IsFunction())		\
		RETURN_EXCEPTION("argument " #I " must be a Function");	\
	Local<Function> VAR = Local<Function>::Cast(ARGS[I]);


#define REQUIRE_OBJECT_ARG(ARGS, I, VAR)				\
	REQUIRE_ARGS(ARGS);						\
	if (ARGS.Length() <= (I) || !ARGS[I]->IsObject())		\
		RETURN_EXCEPTION("argument " #I " must be an Object");	\
	Local<Object> VAR(ARGS[I]->ToObject());



///--- API

NAN_METHOD(Open) {
	NanScope();

	REQUIRE_STRING_ARG(args, 0, ident);
	REQUIRE_INT_ARG(args, 1, logopt);
	REQUIRE_INT_ARG(args, 2, facility);

	openlog(strdup(*ident), logopt, facility);

	NanReturnUndefined();
}

NAN_METHOD(Log) {
	NanScope();

	REQUIRE_INT_ARG(args, 0, priority);
	REQUIRE_STRING_ARG(args, 1, message);

	syslog(priority, "%s", *message);

	NanReturnUndefined();
}

NAN_METHOD(Close) {
	NanScope();

	closelog();

	NanReturnUndefined();
}

NAN_METHOD(Mask) {
	NanEscapableScope();

	REQUIRE_INT_ARG(args, 0, maskpri);

	int mask = setlogmask(LOG_UPTO(maskpri));

	NanReturnValue(NanEscapeScope(NanNew<Integer>(mask)));
}

void init(Handle<Object> target) {
	NODE_SET_METHOD(target, "openlog", Open);
	NODE_SET_METHOD(target, "syslog", Log);
	NODE_SET_METHOD(target, "closelog", Close);
	NODE_SET_METHOD(target, "setlogmask", Mask);

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
