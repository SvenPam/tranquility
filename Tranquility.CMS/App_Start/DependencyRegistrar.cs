using System.Linq;
using System.Reflection;
using System.Web.Compilation;
using System.Web.Http;
using System.Web.Mvc;
using Autofac;
using Autofac.Integration.Mvc;
using Autofac.Integration.WebApi;
using Umbraco.Core;
using Umbraco.Core.Logging;
using Umbraco.Core.Services;
using Umbraco.Web;

namespace Tranquility
{
    /// <summary>
    /// Registers all project dependencies through AutoFac Ioc container.
    /// </summary>
    public static class DependencyRegistrar
    {
        /// <summary>
        /// Registers all project dependencies.
        /// </summary>
        /// <param name="applicationContext">The application context.</param>
        internal static void Register(ApplicationContext applicationContext)
        {
            var builder = new ContainerBuilder();

            builder.RegisterModelBinderProvider();

            var assemblies = BuildManager.GetReferencedAssemblies().Cast<Assembly>().ToArray();

            builder.RegisterApiControllers(assemblies);
            builder.RegisterControllers(assemblies);

            builder
                .RegisterAssemblyTypes(assemblies)
                .AssignableTo<IDependency>()
                .AsImplementedInterfaces()
                .InstancePerDependency();

            builder
                .RegisterAssemblyTypes(assemblies)
                .AssignableTo<ISingletonDependency>()
                .AsImplementedInterfaces()
                .SingleInstance();

            RegisterUmbracoServices(applicationContext, builder);

            var container = builder.Build();

            GlobalConfiguration.Configuration.DependencyResolver = new AutofacWebApiDependencyResolver(container);
            DependencyResolver.SetResolver(new AutofacDependencyResolver(container));
        }

        /// <summary>
        /// Registers the umbraco services.
        /// </summary>
        /// <param name="applicationContext">The application context.</param>
        /// <param name="builder">The builder.</param>
        private static void RegisterUmbracoServices(ApplicationContext applicationContext, ContainerBuilder builder)
        {
            builder.RegisterInstance(applicationContext.Services.ContentService).As<IContentService>();
            builder.RegisterInstance(applicationContext.Services.LocalizationService).As<ILocalizationService>();
            builder.RegisterInstance(applicationContext.Services.MediaService).As<IMediaService>();
            builder.RegisterInstance(applicationContext.Services.MemberService).As<IMemberService>();
            builder.RegisterInstance(applicationContext.Services.UserService).As<IUserService>();
            builder.RegisterInstance(applicationContext.Services.MemberGroupService).As<IMemberGroupService>();
            builder.RegisterInstance(applicationContext.Services.MemberGroupService).As<IMemberGroupService>();
            builder.RegisterInstance(applicationContext.Services.MemberTypeService).As<IMemberTypeService>();
            builder.RegisterInstance(applicationContext.Services.ApplicationTreeService).As<IApplicationTreeService>();
            builder.RegisterInstance(applicationContext.Services.SectionService).As<ISectionService>();
            builder.RegisterInstance(applicationContext.Services.PackagingService).As<IPackagingService>();
            builder.RegisterInstance(applicationContext.Services.FileService).As<IFileService>();
            builder.RegisterInstance(applicationContext.Services.DataTypeService).As<IDataTypeService>();
            builder.RegisterInstance(applicationContext.Services.ContentTypeService).As<IContentTypeService>();
            builder.RegisterInstance(applicationContext.Services.RelationService).As<IRelationService>();
            builder.RegisterInstance(applicationContext.Services.EntityService).As<IEntityService>();
            builder.RegisterInstance(applicationContext.Services.MacroService).As<IMacroService>();
            builder.RegisterInstance(applicationContext.Services.TagService).As<ITagService>();
            builder.RegisterInstance(applicationContext.Services.ServerRegistrationService).As<IServerRegistrationService>();
            builder.RegisterInstance(applicationContext.Services.NotificationService).As<INotificationService>();
            builder.RegisterInstance(applicationContext.Services.TextService).As<ILocalizedTextService>();
            builder.RegisterInstance(applicationContext.Services.AuditService).As<IAuditService>();
            builder.RegisterInstance(applicationContext.Services.DomainService).As<IDomainService>();
            builder.RegisterInstance(applicationContext.Services.TaskService).As<ITaskService>();
            builder.RegisterInstance(applicationContext.Services.PublicAccessService).As<IPublicAccessService>();
            builder.RegisterInstance(applicationContext.Services.MigrationEntryService).As<IMigrationEntryService>();
            builder.RegisterInstance(applicationContext.Services.ExternalLoginService).As<IExternalLoginService>();
            builder.RegisterInstance(applicationContext.Services.RedirectUrlService).As<IRedirectUrlService>();

            UmbracoHelper umbracoHelper = new UmbracoHelper(UmbracoContext.Current);
            builder.RegisterInstance(umbracoHelper.ContentQuery).As<ITypedPublishedContentQuery>();

            builder.Register(c => UmbracoContext.Current);
            builder.Register(c => umbracoHelper);
            builder.RegisterInstance(applicationContext.ProfilingLogger.Logger).As<ILogger>();
        }
    }

    /// <summary>
    /// Interfaces, derived from this interface, automatically registers by AutoFac with singleton lifetime.
    /// </summary>
    public interface ISingletonDependency
    {
    }

    /// <summary>
    /// Interfaces, derived from this interface, automatically registers by AutoFac with per dependency lifetime.
    /// </summary>
    public interface IDependency
    {
    }
}